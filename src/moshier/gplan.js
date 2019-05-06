import { mods3600 } from './util';
import epsilon, { calc as epsilonCalc } from './epsilon';
import constant from './constant';
import moonlat from './plan404/moonlat';
import moonlr from './plan404/moonlr';

const gplan = {
  /* From Simon et al (1994)  */
  freqs: [
    /* Arc sec per 10000 Julian years.  */
    53810162868.8982,
    21066413643.3548,
    12959774228.3429,
    6890507749.3988,
    1092566037.7991,
    439960985.5372,
    154248119.3933,
    78655032.0744,
    52272245.1795
  ],

  phases: [
    /* Arc sec.  */
    252.25090552 * 3600.0,
    181.97980085 * 3600.0,
    100.46645683 * 3600.0,
    355.43299958 * 3600.0,
    34.35151874 * 3600.0,
    50.0774443 * 3600.0,
    314.05500511 * 3600.0,
    304.34866548 * 3600.0,
    860492.1546
  ],

  ss: [],
  cc: [],

  Args: [],
  LP_equinox: 0,
  NF_arcsec: 0,
  Ea_arcsec: 0,
  pA_precession: 0
};

/*
 Routines to chew through tables of perturbations.
*/
export const calc = function(date, body_ptable, polar) {
  var su, cu, sv, cv, T; // double
  var t, sl, sb, sr; // double
  var i, j, k, m, n, k1, ip, np, nt; // int
  var p; // char array
  var pl; // double array
  var pb; // double array
  var pr; // double array

  T = (date.julian - constant.j2000) / body_ptable.timescale;
  n = body_ptable.maxargs;
  /* Calculate sin( i*MM ), etc. for needed multiple angles.  */
  for (i = 0; i < n; i++) {
    if ((j = body_ptable.max_harmonic[i]) > 0) {
      sr = (mods3600(gplan.freqs[i] * T) + gplan.phases[i]) * constant.STR;
      sscc(i, sr, j);
    }
  }

  /* Point to start of table of arguments. */
  p = body_ptable.arg_tbl;

  /* Point to tabulated cosine and sine amplitudes.  */
  pl = body_ptable.lon_tbl;
  pb = body_ptable.lat_tbl;
  pr = body_ptable.rad_tbl;

  sl = 0.0;
  sb = 0.0;
  sr = 0.0;

  var p_i = 0;
  var pl_i = 0;
  var pb_i = 0;
  var pr_i = 0;

  for (;;) {
    /* argument of sine and cosine */
    /* Number of periodic arguments. */
    np = p[p_i++]; // np = *p++
    if (np < 0) {
      break;
    }
    if (np == 0) {
      /* It is a polynomial term.  */
      nt = p[p_i++]; // nt = *p++
      /* Longitude polynomial. */
      cu = pl[pl_i++]; // cu = *pl++;
      for (ip = 0; ip < nt; ip++) {
        cu = cu * T + pl[pl_i++]; //*pl++;
      }
      sl += mods3600(cu);
      /* Latitude polynomial. */
      cu = pb[pb_i++]; //*pb++;
      for (ip = 0; ip < nt; ip++) {
        cu = cu * T + pb[pb_i++]; //*pb++;
      }
      sb += cu;
      /* Radius polynomial. */
      cu = pr[pr_i++]; //*pr++;
      for (ip = 0; ip < nt; ip++) {
        cu = cu * T + pr[pr_i++]; //*pr++;
      }
      sr += cu;
      continue;
    }
    k1 = 0;
    cv = 0.0;
    sv = 0.0;
    for (ip = 0; ip < np; ip++) {
      /* What harmonic.  */
      j = p[p_i++]; //*p++;
      /* Which planet.  */
      m = p[p_i++] - 1; // *p++ - 1
      if (j) {
        k = j;
        if (j < 0) k = -k;
        k -= 1;
        su = gplan.ss[m][k]; /* sin(k*angle) */
        if (j < 0) su = -su;
        cu = gplan.cc[m][k];
        if (k1 == 0) {
          /* set first angle */
          sv = su;
          cv = cu;
          k1 = 1;
        } else {
          /* combine angles */
          t = su * cv + cu * sv;
          cv = cu * cv - su * sv;
          sv = t;
        }
      }
    }
    /* Highest power of T.  */
    nt = p[p_i++]; //*p++;
    /* Longitude. */
    cu = pl[pl_i++]; //*pl++;
    su = pl[pl_i++]; //*pl++;
    for (ip = 0; ip < nt; ip++) {
      cu = cu * T + pl[pl_i++]; //*pl++;
      su = su * T + pl[pl_i++]; //*pl++;
    }
    sl += cu * cv + su * sv;
    /* Latitiude. */
    cu = pb[pb_i++]; //*pb++;
    su = pb[pb_i++]; //*pb++;
    for (ip = 0; ip < nt; ip++) {
      cu = cu * T + pb[pb_i++]; //*pb++;
      su = su * T + pb[pb_i++]; //*pb++;
    }
    sb += cu * cv + su * sv;
    /* Radius. */
    cu = pr[pr_i++]; //*pr++;
    su = pr[pr_i++]; //*pr++;
    for (ip = 0; ip < nt; ip++) {
      cu = cu * T + pr[pr_i++]; //*pr++;
      su = su * T + pr[pr_i++]; //*pr++;
    }
    sr += cu * cv + su * sv;
  }

  polar[0] = constant.STR * sl;
  polar[1] = constant.STR * sb;
  polar[2] = constant.STR * body_ptable.distance * sr + body_ptable.distance;
};

/* Prepare lookup table of sin and cos ( i*Lj )
 * for required multiple angles
 */
export const sscc = function(k, arg, n) {
  var cu, su, cv, sv, s; // double
  var i; // int

  su = Math.sin(arg);
  cu = Math.cos(arg);
  gplan.ss[k] = [];
  gplan.cc[k] = [];

  gplan.ss[k][0] = su; /* sin(L) */
  gplan.cc[k][0] = cu; /* cos(L) */
  sv = 2.0 * su * cu;
  cv = cu * cu - su * su;
  gplan.ss[k][1] = sv; /* sin(2L) */
  gplan.cc[k][1] = cv;
  for (i = 2; i < n; i++) {
    s = su * cv + cu * sv;
    cv = cu * cv - su * sv;
    sv = s;
    gplan.ss[k][i] = sv; /* sin( i+1 L ) */
    gplan.cc[k][i] = cv;
  }
};

/* Compute mean elements at Julian date J.  */
export const meanElements = function(date) {
  var x, T, T2; // double

  /* Time variables.  T is in Julian centuries.  */
  T = (date.julian - 2451545.0) / 36525.0;
  T2 = T * T;

  /* Mean longitudes of planets (Simon et al, 1994)
   .047" subtracted from constant term for offset to DE403 origin. */

  /* Mercury */
  x = mods3600(538101628.6889819 * T + 908103.213);
  x += (6.39e-6 * T - 0.0192789) * T2;
  gplan.Args[0] = constant.STR * x;

  /* Venus */
  x = mods3600(210664136.4335482 * T + 655127.236);
  x += (-6.27e-6 * T + 0.0059381) * T2;
  gplan.Args[1] = constant.STR * x;

  /* Earth  */
  x = mods3600(129597742.283429 * T + 361679.198);
  x += (-5.23e-6 * T - 2.04411e-2) * T2;
  gplan.Ea_arcsec = x;
  gplan.Args[2] = constant.STR * x;

  /* Mars */
  x = mods3600(68905077.493988 * T + 1279558.751);
  x += (-1.043e-5 * T + 0.0094264) * T2;
  gplan.Args[3] = constant.STR * x;

  /* Jupiter */
  x = mods3600(10925660.377991 * T + 123665.42);
  x += ((((-3.4e-10 * T + 5.91e-8) * T + 4.667e-6) * T + 5.706e-5) * T - 3.060378e-1) * T2;
  gplan.Args[4] = constant.STR * x;

  /* Saturn */
  x = mods3600(4399609.855372 * T + 180278.752);
  x += ((((8.3e-10 * T - 1.452e-7) * T - 1.1484e-5) * T - 1.6618e-4) * T + 7.561614e-1) * T2;
  gplan.Args[5] = constant.STR * x;

  /* Uranus */
  x = mods3600(1542481.193933 * T + 1130597.971) + (0.00002156 * T - 0.0175083) * T2;
  gplan.Args[6] = constant.STR * x;

  /* Neptune */
  x = mods3600(786550.320744 * T + 1095655.149) + (-0.00000895 * T + 0.0021103) * T2;
  gplan.Args[7] = constant.STR * x;

  /* Copied from cmoon.c, DE404 version.  */
  /* Mean elongation of moon = D */
  x = mods3600(1.6029616009939659e9 * T + 1.0722612202445078e6);
  x +=
    (((((-3.207663637426e-13 * T + 2.555243317839e-11) * T + 2.560078201452e-9) * T -
      3.702060118571e-5) *
      T +
      6.9492746836058421e-3) *
      T /* D, t^3 */ -
      6.7352202374457519) *
    T2; /* D, t^2 */
  gplan.Args[9] = constant.STR * x;

  /* Mean distance of moon from its ascending node = F */
  x = mods3600(1.7395272628437717e9 * T + 3.357795141288474e5);
  x +=
    (((((4.474984866301e-13 * T + 4.189032191814e-11) * T - 2.790392351314e-9) * T -
      2.165750777942e-6) *
      T -
      7.5311878482337989e-4) *
      T /* F, t^3 */ -
      1.3117809789650071e1) *
    T2; /* F, t^2 */
  gplan.NF_arcsec = x;
  gplan.Args[10] = constant.STR * x;

  /* Mean anomaly of sun = l' (J. Laskar) */
  x = mods3600(1.295965810230432e8 * T + 1.2871027407441526e6);
  x +=
    ((((((((1.62e-20 * T - 1.039e-17) * T - 3.83508e-15) * T + 4.237343e-13) * T + 8.8555011e-11) *
      T -
      4.77258489e-8) *
      T -
      1.1297037031e-5) *
      T +
      8.7473717367324703e-5) *
      T -
      5.5281306421783094e-1) *
    T2;
  gplan.Args[11] = constant.STR * x;

  /* Mean anomaly of moon = l */
  x = mods3600(1.7179159228846793e9 * T + 4.8586817465825332e5);
  x +=
    (((((-1.755312760154e-12 * T + 3.452144225877e-11) * T - 2.506365935364e-8) * T -
      2.536291235258e-4) *
      T +
      5.2099641302735818e-2) *
      T /* l, t^3 */ +
      3.1501359071894147e1) *
    T2; /* l, t^2 */
  gplan.Args[12] = constant.STR * x;

  /* Mean longitude of moon, re mean ecliptic and equinox of date = L  */
  x = mods3600(1.7325643720442266e9 * T + 7.859398092105242e5);
  x +=
    (((((7.200592540556e-14 * T + 2.235210987108e-10) * T - 1.024222633731e-8) * T -
      6.073960534117e-5) *
      T +
      6.901724852838049e-3) *
      T /* L, t^3 */ -
      5.6550460027471399) *
    T2; /* L, t^2 */
  gplan.LP_equinox = x;
  gplan.Args[13] = constant.STR * x;

  /* Precession of the equinox  */
  x =
    (((((((((-8.66e-20 * T - 4.759e-17) * T + 2.424e-15) * T + 1.3095e-12) * T + 1.7451e-10) * T -
      1.8055e-8) *
      T -
      0.0000235316) *
      T +
      0.000076) *
      T +
      1.105414) *
      T +
      5028.791959) *
    T;
  /* Moon's longitude re fixed J2000 equinox.  */
  /*
   Args[13] -= x;
   */
  gplan.pA_precession = constant.STR * x;

  /* Free librations.  */
  /* longitudinal libration 2.891725 years */
  x = mods3600(4.48175409e7 * T + 8.060457e5);
  gplan.Args[14] = constant.STR * x;
  /* libration P, 24.2 years */
  x = mods3600(5.36486787e6 * T - 391702.8);
  gplan.Args[15] = constant.STR * x;

  /* libration W, 74.7 years. */
  x = mods3600(1.73573e6 * T);
  gplan.Args[17] = constant.STR * x;
};

/* Generic program to accumulate sum of trigonometric series
 in three variables (e.g., longitude, latitude, radius)
 of the same list of arguments.  */
export const calc3 = function(date, body_ptable, polar, body_number) {
  var i, j, k, m, n, k1, ip, np, nt; // int
  var p; // int array
  var pl; // double array
  var pb; // double array
  var pr; // double array

  var su, cu, sv, cv; // double
  var T, t, sl, sb, sr; // double

  meanElements(date);

  T = (date.julian - constant.j2000) / body_ptable.timescale;
  n = body_ptable.maxargs;
  /* Calculate sin( i*MM ), etc. for needed multiple angles.  */
  for (i = 0; i < n; i++) {
    if ((j = body_ptable.max_harmonic[i]) > 0) {
      sscc(i, gplan.Args[i], j);
    }
  }

  /* Point to start of table of arguments. */
  p = body_ptable.arg_tbl;
  /* Point to tabulated cosine and sine amplitudes.  */
  pl = body_ptable.lon_tbl;
  pb = body_ptable.lat_tbl;
  pr = body_ptable.rad_tbl;

  sl = 0.0;
  sb = 0.0;
  sr = 0.0;

  var p_i = 0;
  var pl_i = 0;
  var pb_i = 0;
  var pr_i = 0;

  for (;;) {
    /* argument of sine and cosine */
    /* Number of periodic arguments. */
    np = p[p_i++]; //*p++;
    if (np < 0) break;
    if (np == 0) {
      /* It is a polynomial term.  */
      nt = p[p_i++]; //*p++;
      /* "Longitude" polynomial (phi). */
      cu = pl[pl_i++]; //*pl++;
      for (ip = 0; ip < nt; ip++) {
        cu = cu * T + pl[pl_i++]; //*pl++;
      }
      /*    sl +=  mods3600 (cu); */
      sl += cu;
      /* "Latitude" polynomial (theta). */
      cu = pb[pb_i++]; //*pb++;
      for (ip = 0; ip < nt; ip++) {
        cu = cu * T + pb[pb_i++]; //*pb++;
      }
      sb += cu;
      /* Radius polynomial (psi). */
      cu = pr[pr_i++]; //*pr++;
      for (ip = 0; ip < nt; ip++) {
        cu = cu * T + pr[pr_i++]; //*pr++;
      }
      sr += cu;
      continue;
    }
    k1 = 0;
    cv = 0.0;
    sv = 0.0;
    for (ip = 0; ip < np; ip++) {
      /* What harmonic.  */
      j = p[p_i++]; //*p++;
      /* Which planet.  */
      m = p[p_i++] - 1; //*p++ - 1;
      if (j) {
        /*        k = abs (j); */
        if (j < 0) k = -j;
        else k = j;
        k -= 1;
        su = gplan.ss[m][k]; /* sin(k*angle) */
        if (j < 0) su = -su;
        cu = gplan.cc[m][k];
        if (k1 == 0) {
          /* set first angle */
          sv = su;
          cv = cu;
          k1 = 1;
        } else {
          /* combine angles */
          t = su * cv + cu * sv;
          cv = cu * cv - su * sv;
          sv = t;
        }
      }
    }
    /* Highest power of T.  */
    nt = p[p_i++]; //*p++;
    /* Longitude. */
    cu = pl[pl_i++]; //*pl++;
    su = pl[pl_i++]; //*pl++;
    for (ip = 0; ip < nt; ip++) {
      cu = cu * T + pl[pl_i++]; //*pl++;
      su = su * T + pl[pl_i++]; //*pl++;
    }
    sl += cu * cv + su * sv;
    /* Latitiude. */
    cu = pb[pb_i++]; //*pb++;
    su = pb[pb_i++]; //*pb++;
    for (ip = 0; ip < nt; ip++) {
      cu = cu * T + pb[pb_i++]; //*pb++;
      su = su * T + pb[pb_i++]; //*pb++;
    }
    sb += cu * cv + su * sv;
    /* Radius. */
    cu = pr[pr_i++]; //*pr++;
    su = pr[pr_i++]; //*pr++;
    for (ip = 0; ip < nt; ip++) {
      cu = cu * T + pr[pr_i++]; //*pr++;
      su = su * T + pr[pr_i++]; //*pr++;
    }
    sr += cu * cv + su * sv;
  }
  t = body_ptable.trunclvl;
  polar[0] = gplan.Args[body_number - 1] + constant.STR * t * sl;
  polar[1] = constant.STR * t * sb;
  polar[2] = body_ptable.distance * (1.0 + constant.STR * t * sr);
};

/* Generic program to accumulate sum of trigonometric series
 in two variables (e.g., longitude, radius)
 of the same list of arguments.  */
export const calc2 = function(date, body_ptable, polar) {
  var i, j, k, m, n, k1, ip, np, nt; // int
  var p; // int array
  var pl; // double array
  var pr; // double array

  var su, cu, sv, cv; // double
  var T, t, sl, sr; // double

  meanElements(date);

  T = (date.julian - constant.j2000) / body_ptable.timescale;
  n = body_ptable.maxargs;
  /* Calculate sin( i*MM ), etc. for needed multiple angles.  */
  for (i = 0; i < n; i++) {
    if ((j = body_ptable.max_harmonic[i]) > 0) {
      sscc(i, gplan.Args[i], j);
    }
  }

  /* Point to start of table of arguments. */
  p = body_ptable.arg_tbl;
  /* Point to tabulated cosine and sine amplitudes.  */
  pl = body_ptable.lon_tbl;
  pr = body_ptable.rad_tbl;

  var p_i = 0;
  var pl_i = 0;
  var pr_i = 0;

  sl = 0.0;
  sr = 0.0;

  for (;;) {
    /* argument of sine and cosine */
    /* Number of periodic arguments. */
    np = p[p_i++]; //*p++;
    if (np < 0) break;
    if (np == 0) {
      /* It is a polynomial term.  */
      nt = p[p_i++]; //*p++;
      /* Longitude polynomial. */
      cu = pl[pl_i++]; //*pl++;
      for (ip = 0; ip < nt; ip++) {
        cu = cu * T + pl[pl_i++]; //*pl++;
      }
      /*    sl +=  mods3600 (cu); */
      sl += cu;
      /* Radius polynomial. */
      cu = pr[pr_i++]; //*pr++;
      for (ip = 0; ip < nt; ip++) {
        cu = cu * T + pr[pr_i++]; //*pr++;
      }
      sr += cu;
      continue;
    }
    k1 = 0;
    cv = 0.0;
    sv = 0.0;
    for (ip = 0; ip < np; ip++) {
      /* What harmonic.  */
      j = p[p_i++]; //*p++;
      /* Which planet.  */
      m = p[p_i++] - 1; //*p++ - 1;
      if (j) {
        /*        k = abs (j); */
        if (j < 0) k = -j;
        else k = j;
        k -= 1;
        su = gplan.ss[m][k]; /* sin(k*angle) */
        if (j < 0) su = -su;
        cu = gplan.cc[m][k];
        if (k1 == 0) {
          /* set first angle */
          sv = su;
          cv = cu;
          k1 = 1;
        } else {
          /* combine angles */
          t = su * cv + cu * sv;
          cv = cu * cv - su * sv;
          sv = t;
        }
      }
    }
    /* Highest power of T.  */
    nt = p[p_i++]; //*p++;
    /* Longitude. */
    cu = pl[pl_i++]; //*pl++;
    su = pl[pl_i++]; //*pl++;
    for (ip = 0; ip < nt; ip++) {
      cu = cu * T + pl[pl_i++]; //*pl++;
      su = su * T + pl[pl_i++]; //*pl++;
    }
    sl += cu * cv + su * sv;
    /* Radius. */
    cu = pr[pr_i++]; //*pr++;
    su = pr[pr_i++]; //*pr++;
    for (ip = 0; ip < nt; ip++) {
      cu = cu * T + pr[pr_i++]; //*pr++;
      su = su * T + pr[pr_i++]; //*pr++;
    }
    sr += cu * cv + su * sv;
  }
  t = body_ptable.trunclvl;
  polar[0] = t * sl;
  polar[2] = t * sr;
};

/* Generic program to accumulate sum of trigonometric series
 in one variable.  */
export const calc1 = function(date, body_ptable) {
  var i, j, k, m, k1, ip, np, nt; // int
  var p; // int array
  var pl; // double array

  var su, cu, sv, cv; // double
  var T, t, sl; // double

  T = (date.julian - constant.j2000) / body_ptable.timescale;
  meanElements(date);
  /* Calculate sin( i*MM ), etc. for needed multiple angles.  */
  for (i = 0; i < gplan.Args.length; i++) {
    if ((j = body_ptable.max_harmonic[i]) > 0) {
      sscc(i, gplan.Args[i], j);
    }
  }

  /* Point to start of table of arguments. */
  p = body_ptable.arg_tbl;
  /* Point to tabulated cosine and sine amplitudes.  */
  pl = body_ptable.lon_tbl;

  sl = 0.0;

  var p_i = 0;
  var pl_i = 0;

  for (;;) {
    /* argument of sine and cosine */
    /* Number of periodic arguments. */
    np = p[p_i++]; //*p++;
    if (np < 0) break;
    if (np == 0) {
      /* It is a polynomial term.  */
      nt = p[p_i++]; //*p++;
      cu = pl[pl_i++]; //*pl++;
      for (ip = 0; ip < nt; ip++) {
        cu = cu * T + pl[pl_i++]; //*pl++;
      }
      /*    sl +=  mods3600 (cu); */
      sl += cu;
      continue;
    }
    k1 = 0;
    cv = 0.0;
    sv = 0.0;
    for (ip = 0; ip < np; ip++) {
      /* What harmonic.  */
      j = p[p_i++]; //*p++;
      /* Which planet.  */
      m = p[p_i++] - 1; //*p++ - 1;
      if (j) {
        /* k = abs (j); */
        if (j < 0) k = -j;
        else k = j;
        k -= 1;
        su = gplan.ss[m][k]; /* sin(k*angle) */
        if (j < 0) su = -su;
        cu = gplan.cc[m][k];
        if (k1 == 0) {
          /* set first angle */
          sv = su;
          cv = cu;
          k1 = 1;
        } else {
          /* combine angles */
          t = su * cv + cu * sv;
          cv = cu * cv - su * sv;
          sv = t;
        }
      }
    }
    /* Highest power of T.  */
    nt = p[p_i++]; //*p++;
    /* Cosine and sine coefficients.  */
    cu = pl[pl_i++]; //*pl++;
    su = pl[pl_i++]; //*pl++;
    for (ip = 0; ip < nt; ip++) {
      cu = cu * T + pl[pl_i++]; //*pl++;
      su = su * T + pl[pl_i++]; //*pl++;
    }
    sl += cu * cv + su * sv;
  }
  return body_ptable.trunclvl * sl;
};

/* Compute geocentric moon.  */
export const moon = function(date, rect, pol) {
  var x, cosB, sinB, cosL, sinL; // double

  calc2(date, moonlr, pol);
  x = pol[0];
  x += gplan.LP_equinox;
  if (x < -6.48e5) {
    x += 1.296e6;
  }
  if (x > 6.48e5) {
    x -= 1.296e6;
  }
  pol[0] = constant.STR * x;
  x = calc1(date, moonlat);
  pol[1] = constant.STR * x;
  x = (1.0 + constant.STR * pol[2]) * moonlr.distance;
  pol[2] = x;
  /* Convert ecliptic polar to equatorial rectangular coordinates.  */
  epsilonCalc(date);
  cosB = Math.cos(pol[1]);
  sinB = Math.sin(pol[1]);
  cosL = Math.cos(pol[0]);
  sinL = Math.sin(pol[0]);
  rect[0] = cosB * cosL * x;
  rect[1] = (epsilon.coseps * cosB * sinL - epsilon.sineps * sinB) * x;
  rect[2] = (epsilon.sineps * cosB * sinL + epsilon.coseps * sinB) * x;
};

export default gplan;
