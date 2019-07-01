import { copy } from './common';
import constant from './constant';
import variable from './variable';

export const mods3600 = function(value) {
  return value - 1.296e6 * Math.floor(value / 1.296e6);
};

/* Reduce x modulo 2 pi */
export const modtp = function(x) {
  let y = Math.floor(x / constant.TPI);
  y = x - y * constant.TPI;
  while (y < 0.0) {
    y += constant.TPI;
  }
  while (y >= constant.TPI) {
    y -= constant.TPI;
  }
  return y;
};

/* Reduce x modulo 360 degrees */
export const mod360 = function(x) {
  const k = Math.floor(x / 360.0);
  let y = x - k * 360.0;
  while (y < 0.0) {
    y += 360.0;
  }
  while (y > 360.0) {
    y -= 360.0;
  }
  return y;
};

/* Reduce x modulo 30 degrees */
export const mod30 = function(x) {
  const k = Math.floor(x / 30.0);
  let y = x - k * 30.0;
  while (y < 0.0) {
    y += 30.0;
  }
  while (y > 30.0) {
    y -= 30.0;
  }
  return y;
};

export const zatan2 = function(x, y) {
  let code = 0;

  if (x < 0.0) {
    code = 2;
  }
  if (y < 0.0) {
    code |= 1;
  }

  if (x == 0.0) {
    if (code & 1) {
      return 1.5 * Math.PI;
    }
    if (y == 0.0) {
      return 0.0;
    }
    return 0.5 * Math.PI;
  }

  if (y == 0.0) {
    if (code & 2) {
      return Math.PI;
    }
    return 0.0;
  }

  let w;
  switch (code) {
    default:
    case 0:
      w = 0.0;
      break;
    case 1:
      w = 2.0 * Math.PI;
      break;
    case 2:
    case 3:
      w = Math.PI;
      break;
  }

  return w + Math.atan(y / x);
};

export const sinh = function(x) {
  return (Math.exp(x) - Math.exp(-x)) / 2;
};

export const cosh = function(x) {
  return (Math.exp(x) + Math.exp(-x)) / 2;
};

export const tanh = function(x) {
  return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
};

export const hms = function(x) {
  const result = {};

  let s = x * constant.RTOH;
  if (s < 0.0) {
    s += 24.0;
  }
  let h = Math.floor(s);
  s -= h;
  s *= 60;
  let m = Math.floor(s);
  s -= m;
  s *= 60;
  /* Handle shillings and pence roundoff. */
  let sfrac = Math.floor(1000.0 * s + 0.5);
  if (sfrac >= 60000) {
    sfrac -= 60000;
    m += 1;
    if (m >= 60) {
      m -= 60;
      h += 1;
    }
  }
  const sint = Math.floor(sfrac / 1000);
  sfrac -= Math.floor(sint * 1000);

  result.hours = h;
  result.minutes = m;
  result.seconds = sint;
  result.milliseconds = sfrac;

  return result;
};

export const dms = function(x) {
  const result = {};

  let s = x * constant.RTD;
  if (s < 0.0) {
    s = -s;
  }
  const d = Math.floor(s);
  s -= d;
  s *= 60;
  const m = Math.floor(s);
  s -= m;
  s *= 60;

  result.degree = d;
  result.minutes = m;
  result.seconds = s;

  return result;
};

/* Display Right Ascension and Declination
 * from input equatorial rectangular unit vector.
 * Output vector pol[] contains R.A., Dec., and radius.
 */
export const showrd = function(p, pol, result) {
  let r = 0.0;
  for (let i = 0; i < 3; i++) {
    const x = p[i];
    r += x * x;
  }
  r = Math.sqrt(r);

  const x = zatan2(p[0], p[1]);
  pol[0] = x;

  const y = Math.asin(p[2] / r);
  pol[1] = y;

  pol[2] = r;

  result = result || {};

  copy(result, {
    dRA: x,
    dDec: y,
    ra: hms(x),
    dec: dms(y)
  });

  return result;
};

/*
 * Convert change in rectangular coordinatates to change
 * in right ascension and declination.
 * For changes greater than about 0.1 degree, the
 * coordinates are converted directly to R.A. and Dec.
 * and the results subtracted.  For small changes,
 * the change is calculated to first order by differentiating
 *   tan(R.A.) = y/x
 * to obtain
 *    dR.A./cos**2(R.A.) = dy/x  -  y dx/x**2
 * where
 *    cos**2(R.A.)  =  1/(1 + (y/x)**2).
 *
 * The change in declination arcsin(z/R) is
 *   d asin(u) = du/sqrt(1-u**2)
 *   where u = z/R.
 *
 * p0 is the initial object - earth vector and
 * p1 is the vector after motion or aberration.
 *
 */
export const deltap = function(p0, p1, d) {
  d = d || {};

  const dp = [];
  let P0 = 0.0;
  let Q0 = 0.0;
  let z0 = 0.0;
  for (let i = 0; i < 3; i++) {
    const x = p0[i];
    let y = p1[i];
    P0 += x * x;
    Q0 += y * y;
    y = y - x;
    dp[i] = y;
    z0 += y * y;
  }

  const A = Math.sqrt(P0);
  const B = Math.sqrt(Q0);

  if (A < 1.0e-7 || B < 1.0e-7 || z0 / (P0 + Q0) > 5.0e-7) {
    const P1 = zatan2(p0[0], p0[1]);
    let Q = zatan2(p1[0], p1[1]) - P1;
    while (Q < -Math.PI) {
      Q += 2.0 * Math.PI;
    }
    while (Q > Math.PI) {
      Q -= 2.0 * Math.PI;
    }
    d.dr = Q;
    const P2 = Math.asin(p0[2] / A);
    const Q2 = Math.asin(p1[2] / B);
    d.dd = Q2 - P2;
    return d;
  }

  const xx1 = p0[0];
  const y = p0[1];
  if (xx1 == 0.0) {
    d.dr = 1.0e38;
  } else {
    const yxx1 = y / xx1;
    d.dr = (dp[1] - (dp[0] * y) / xx1) / (xx1 * (1.0 + yxx1 * yxx1));
  }

  const xx2 = p0[2] / A;
  const P3 = Math.sqrt(1.0 - xx2 * xx2);
  d.dd = (p1[2] / B - xx2) / P3;

  return d;
};

/* Display magnitude of correction vector in arc seconds */
export const showcor = function(p, dp, result) {
  const p1 = [];
  for (let i = 0; i < 3; i++) {
    p1[i] = p[i] + dp[i];
  }

  const d = deltap(p, p1);

  result = result || {};
  result.dRA = (constant.RTS * d.dr) / 15.0;
  result.dDec = constant.RTS * d.dd;

  return result;
};

/* Sun - object - earth angles and distances.
 * q (object), e (earth), and p (q minus e) are input vectors.
 * The answers are posted in the following global locations:
 */
export const angles = function(p, q, e) {
  variable.EO = 0.0;
  variable.SE = 0.0;
  variable.SO = 0.0;
  variable.pq = 0.0;
  variable.ep = 0.0;
  variable.qe = 0.0;
  for (let i = 0; i < 3; i++) {
    const a = e[i];
    const b = q[i];
    const s = p[i];
    variable.EO += s * s;
    variable.SE += a * a;
    variable.SO += b * b;
    variable.pq += s * b;
    variable.ep += a * s;
    variable.qe += b * a;
  }
  variable.EO = Math.sqrt(variable.EO); /* Distance between Earth and object */
  variable.SO = Math.sqrt(variable.SO); /* Sun - object */
  variable.SE = Math.sqrt(variable.SE); /* Sun - earth */
  /* Avoid fatality: if object equals sun, SO is zero.  */
  if (variable.SO > 1.0e-12) {
    variable.pq /= variable.EO * variable.SO; /* cosine of sun-object-earth */
    variable.qe /= variable.SO * variable.SE; /* cosine of earth-sun-object */
  }
  variable.ep /= variable.SE * variable.EO; /* -cosine of sun-earth-object */
};

/* Calculate angular separation between two objects
 * Src1, Src2 are body objects
 */
export const separation = function(Src1, Src2) {
  const ra1 = parseFloat(Src1.position.altaz.topocentric.ra);
  const dc1 = parseFloat(Src1.position.altaz.topocentric.dec);
  const ra2 = parseFloat(Src2.position.altaz.topocentric.ra);
  const dc2 = parseFloat(Src2.position.altaz.topocentric.dec);
  const t = Math.sin(dc1) * Math.sin(dc2) + Math.cos(dc1) * Math.cos(dc2) * Math.cos(ra1 - ra2);

  return constant.RTD * Math.acos(t);
};
