import { showcor, deltap } from './util';
import { calc as keplerCalc } from './kepler';
import vearth, { calc as vearthCalc } from './vearth';
import bodies from './body';
import variable from './variable';

export const calc = function(body, q, e) {
  var p = [],
    p0 = [],
    ptemp = []; // double
  var P, Q, E, t, x, y; // double
  var i, k; // int

  /* save initial q-e vector for display */
  for (i = 0; i < 3; i++) {
    p0[i] = q[i] - e[i];
  }

  E = 0.0;
  for (i = 0; i < 3; i++) {
    E += e[i] * e[i];
  }
  E = Math.sqrt(E);

  for (k = 0; k < 2; k++) {
    P = 0.0;
    Q = 0.0;
    for (i = 0; i < 3; i++) {
      y = q[i];
      x = y - e[i];
      p[i] = x;
      Q += y * y;
      P += x * x;
    }
    P = Math.sqrt(P);
    Q = Math.sqrt(Q);
    /* Note the following blows up if object equals sun. */
    t = (P + 1.97e-8 * Math.log((E + P + Q) / (E - P + Q))) / 173.1446327;
    keplerCalc({ julian: bodies.earth.position.date.julian - t }, body, q, ptemp);
  }

  body.lightTime = 1440.0 * t;

  /* Final object-earth vector and the amount by which it changed. */
  for (i = 0; i < 3; i++) {
    x = q[i] - e[i];
    p[i] = x;
    variable.dp[i] = x - p0[i];
  }
  body.aberration = showcor(p0, variable.dp);

  /* Calculate dRA/dt and dDec/dt.
   * The desired correction of apparent coordinates is relative
   * to the equinox of date, but the coordinates here are
   * for J2000.  This introduces a slight error.
   *
   * Estimate object-earth vector t days ago.  We have
   * p(?) = q(J-t) - e(J), and must adjust to
   * p(J-t)  =  q(J-t) - e(J-t)  =  q(J-t) - (e(J) - Vearth * t)
   *         =  p(?) + Vearth * t.
   */
  vearthCalc(bodies.earth.position.date);

  for (i = 0; i < 3; i++) {
    p[i] += vearth.vearth[i] * t;
  }

  var d = deltap(p, p0); /* see dms.c */
  variable.dradt = d.dr;
  variable.ddecdt = d.dd;
  variable.dradt /= t;
  variable.ddecdt /= t;
};
