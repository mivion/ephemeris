import { showcor } from './util';
import vearth, { calc as vearthCalc } from './vearth';
import constant from './constant';
import bodies from './body';
import variable from './variable';

export const calc = function(p, result) {
  let A, B, C, betai, pV; // double
  const x = [],
    V = []; // double
  let i; // int

  /* Calculate the velocity of the earth (see vearth.c). */
  vearthCalc(bodies.earth.position.date);
  betai = 0.0;
  pV = 0.0;
  for (i = 0; i < 3; i++) {
    A = vearth.vearth[i] / constant.Clightaud;
    V[i] = A;
    betai += A * A;
    pV += p[i] * A;
  }
  /* Make the adjustment for aberration. */
  betai = Math.sqrt(1.0 - betai);
  C = 1.0 + pV;
  A = betai / C;
  B = (1.0 + pV / (1.0 + betai)) / C;

  for (i = 0; i < 3; i++) {
    C = A * p[i] + B * V[i];
    x[i] = C;
    variable.dp[i] = C - p[i];
  }

  result = result || {};

  showcor(p, variable.dp, result);
  for (i = 0; i < 3; i++) {
    p[i] = x[i];
  }

  return result;
};
