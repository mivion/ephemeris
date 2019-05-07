import { calc as keplerCalc } from './kepler';
import bodies from './body';

const vearth = {
  jvearth: -1.0,
  vearth: []
};

export const calc = function(date) {
  if (date.julian == vearth.jvearth) {
    return;
  }
  vearth.jvearth = date.julian;

  /* calculate heliocentric position of the earth as of a short time ago. */
  const t = 0.005;
  const e = [];
  const p = [];
  keplerCalc({ julian: date.julian - t }, bodies.earth, e, p);

  for (let i = 0; i < 3; i++) {
    vearth.vearth[i] = (bodies.earth.position.rect[i] - e[i]) / t;
  }
};

export default vearth;
