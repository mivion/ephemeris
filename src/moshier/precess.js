import epsilon, { calc as epsilonCalc } from './epsilon';
import constant from './constant';

const precess = {
  /* In WILLIAMS and SIMON, Laskar's terms of order higher than t^4
   have been retained, because Simon et al mention that the solution
   is the same except for the lower order terms.  */
  pAcof: [
    /* eslint-disable prettier/prettier */
    /* Corrections to Williams (1994) introduced in DE403.  */
    -8.66e-10, -4.759e-8, 2.424e-7, 1.3095e-5, 1.7451e-4, -1.8055e-3,
    -0.235316, 0.076, 110.5414, 50287.91959
    /* eslint-enable prettier/prettier */
  ],
  /* Pi from Williams' 1994 paper, in radians.  No change in DE403.  */
  nodecof: [
    /* eslint-disable prettier/prettier */
    6.6402e-16, -2.69151e-15, -1.547021e-12, 7.521313e-12, 1.9e-10,
    -3.54e-9, -1.8103e-7,  1.26e-7,  7.436169e-5,
    -0.04207794833,  3.052115282424
    /* eslint-enable prettier/prettier */
  ],
  /* pi from Williams' 1994 paper, in radians.  No change in DE403.  */
  inclcof: [
    /* eslint-disable prettier/prettier */
    1.2147e-16, 7.3759e-17, -8.26287e-14, 2.503410e-13, 2.4650839e-11,
    -5.4000441e-11, 1.32115526e-9, -6.012e-7, -1.62442e-5,
    0.00227850649, 0.0
    /* eslint-enable prettier/prettier */
  ]
};

/* Precession of the equinox and ecliptic
 * from epoch Julian date J to or from J2000.0
 *
 * Subroutine arguments:
 *
 * R = rectangular equatorial coordinate vector to be precessed.
 *     The result is written back into the input vector.
 * J = Julian date
 * direction =
 *      Precess from J to J2000: direction = 1
 *      Precess from J2000 to J: direction = -1
 * Note that if you want to precess from J1 to J2, you would
 * first go from J1 to J2000, then call the program again
 * to go from J2000 to J2.
 */
export const calc = function(R, date, direction) {
  let p_i = 0;

  if (date.julian == constant.j2000) {
    return;
  }
  /* Each precession angle is specified by a polynomial in
   * T = Julian centuries from J2000.0.  See AA page B18.
   */
  let T = (date.julian - constant.j2000) / 36525.0;

  /* Implementation by elementary rotations using Laskar's expansions.
   * First rotate about the x axis from the initial equator
   * to the ecliptic. (The input is equatorial.)
   */
  if (direction == 1) {
    epsilonCalc(date); /* To J2000 */
  } else {
    epsilonCalc({ julian: constant.j2000 }); /* From J2000 */
  }
  const x = []; // double
  x[0] = R[0];
  x[2] = -epsilon.sineps * R[1] + epsilon.coseps * R[2];
  x[1] = epsilon.coseps * R[1] + epsilon.sineps * R[2];

  /* Precession in longitude
   */
  T /= 10.0; /* thousands of years */
  const pp1 = precess.pAcof;
  let pA = pp1[p_i++]; //*p++;
  for (let i = 0; i < 9; i++) {
    pA = pA * T + pp1[p_i++]; //*p++;
  }
  pA *= constant.STR * T;

  /* Node of the moving ecliptic on the J2000 ecliptic. */
  const pp2 = precess.nodecof;
  p_i = 0;
  let W = pp2[p_i++]; //*p++;
  for (let i = 0; i < 10; i++) {
    W = W * T + pp2[p_i++]; //*p++;
  }

  /* Rotate about z axis to the node. */
  const zz1 = direction == 1 ? W + pA : W;
  const BB1 = Math.cos(zz1);
  const AA1 = Math.sin(zz1);
  const tt1 = BB1 * x[0] + AA1 * x[1];
  x[1] = -AA1 * x[0] + BB1 * x[1];
  x[0] = tt1;

  /* Rotate about new x axis by the inclination of the moving ecliptic on the J2000 ecliptic. */
  const pp3 = precess.inclcof;
  p_i = 0;
  let zz2 = pp3[p_i++]; //*p++;
  for (let i = 0; i < 10; i++) {
    zz2 = zz2 * T + pp3[p_i++]; //*p++;
  }
  if (direction == 1) {
    zz2 = -zz2;
  }
  const BB2 = Math.cos(zz2);
  const AA2 = Math.sin(zz2);
  const tt2 = BB2 * x[1] + AA2 * x[2];
  x[2] = -AA2 * x[1] + BB2 * x[2];
  x[1] = tt2;

  /* Rotate about new z axis back from the node. */
  const zz3 = direction == 1 ? -W : -W - pA;
  const BB3 = Math.cos(zz3);
  const AA3 = Math.sin(zz3);
  const tt3 = BB3 * x[0] + AA3 * x[1];
  x[1] = -AA3 * x[0] + BB3 * x[1];
  x[0] = tt3;

  /* Rotate about x axis to final equator. */
  if (direction == 1) {
    epsilonCalc({ julian: constant.j2000 });
  } else {
    epsilonCalc(date);
  }
  const z = epsilon.coseps * x[1] - epsilon.sineps * x[2];
  x[2] = epsilon.sineps * x[1] + epsilon.coseps * x[2];
  x[1] = z;

  for (let i = 0; i < 3; i++) {
    R[i] = x[i];
  }
};

export default precess;
