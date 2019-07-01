import { zatan2 } from './util';
import constant from './constant';

const fk4fk5 = {
  /* Factors to eliminate E terms of aberration */
  A: [-1.62557e-6, -3.1919e-7, -1.3843e-7],
  Ad: [1.244e-3, -1.579e-3, -6.6e-4],

  /* Transformation matrix for unit direction vector,
   * and motion vector in arc seconds per century
   */
  Mat: [
    /* eslint-disable prettier/prettier */
    0.9999256782, -0.0111820611, -4.8579477e-3,
    2.42395018e-6, -2.710663e-8, -1.177656e-8,
    0.0111820610, 0.9999374784, -2.71765e-5,
    2.710663e-8, 2.42397878e-6, -6.587e-11,
    4.8579479e-3, -2.71474e-5, 0.9999881997,
    1.177656e-8, -6.582e-11, 2.42410173e-6,
    -5.51e-4, -0.238565, 0.435739,
    0.99994704, -0.01118251, -4.85767e-3,
    0.238514, -2.667e-3, -8.541e-3,
    0.01118251, 0.99995883, -2.718e-5,
    -0.435623, 0.012254, 2.117e-3,
    4.85767e-3, -2.714e-5, 1.00000956
    /* eslint-enable prettier/prettier */
  ]
};

/* Convert FK4 B1950.0 catalogue coordinates to FK5 J2000.0 coordinates.
 * AA page B58.
 */
export const calc = function(p, m, el) {
  /* Note the direction vector and motion vector
   * are already supplied by rstar.c.
   */
  let a = 0.0;
  let b = 0.0;
  for (let i = 0; i < 3; i++) {
    m[i] *= constant.RTS; /* motion must be in arc seconds per century */
    a += fk4fk5.A[i] * p[i];
    b += fk4fk5.Ad[i] * p[i];
  }
  /* Remove E terms of aberration from FK4 */
  const R = [];
  for (let i = 0; i < 3; i++) {
    R[i] = p[i] - fk4fk5.A[i] + a * p[i];
    R[i + 3] = m[i] - fk4fk5.Ad[i] + b * p[i];
  }

  let u_i = 0;
  let v_i = 0;

  /* Perform matrix multiplication */
  const v = fk4fk5.Mat;
  for (let i = 0; i < 6; i++) {
    a = 0.0;
    const u = R;
    for (let j = 0; j < 6; j++) {
      a += u[u_i++] * v[v_i++]; //*u++ * *v++;
    }
    if (i < 3) {
      p[i] = a;
    } else {
      m[i - 3] = a;
    }
  }

  /* Transform the answers into J2000 catalogue entries in radian measure. */
  b = p[0] * p[0] + p[1] * p[1];
  a = b + p[2] * p[2];
  const c = a;
  a = Math.sqrt(a);

  el.ra = zatan2(p[0], p[1]);
  el.dec = Math.asin(p[2] / a);

  /* Note motion converted back to radians per (Julian) century */
  el.raMotion = (p[0] * m[1] - p[1] * m[0]) / (constant.RTS * b);
  el.decMotion =
    (m[2] * b - p[2] * (p[0] * m[0] + p[1] * m[1])) / (constant.RTS * c * Math.sqrt(b));

  if (el.parallax > 0.0) {
    let c1 = 0.0;
    for (let i = 0; i < 3; i++) {
      c1 += p[i] * m[i];
    }
    /* divide by RTS to deconvert m (and therefore c) from arc seconds back to radians */
    el.velocity = c1 / (21.094952663 * el.parallax * constant.RTS * a);
  }
  el.parallax = el.parallax / a; /* a is dimensionless */
  el.epoch = constant.j2000;
};

export default fk4fk5;
