import { showcor } from './util';
import vearth, { calc as vearthCalc } from './vearth';
import constant from './constant';
import bodies from './body';
import variable from './variable';

export const calc = function(p, result) {
  /* Calculate the velocity of the earth (see vearth.c). */
  vearthCalc(bodies.earth.position.date);

  let betai = 0.0;
  let pV = 0.0;
  const V = [];
  for (let i = 0; i < 3; i++) {
    const A = vearth.vearth[i] / constant.Clightaud;
    V[i] = A;
    betai += A * A;
    pV += p[i] * A;
  }

  /* Make the adjustment for aberration. */
  betai = Math.sqrt(1.0 - betai);
  const C = 1.0 + pV;
  const A = betai / C;
  const B = (1.0 + pV / (1.0 + betai)) / C;

  const x = [];
  for (let i = 0; i < 3; i++) {
    const C2 = A * p[i] + B * V[i];
    x[i] = C2;
    variable.dp[i] = C2 - p[i];
  }

  result = result || {};

  showcor(p, variable.dp, result);
  for (let i = 0; i < 3; i++) {
    p[i] = x[i];
  }

  return result;
};
