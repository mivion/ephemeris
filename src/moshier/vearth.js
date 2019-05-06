import { calc as keplerCalc } from './kepler';
import bodies from './body';

const vearth = {
  jvearth: -1.0,
  vearth: []
};

export const calc = function(date) {
  var e = [],
    p = [],
    t; // double
  var i; // int

  if (date.julian == vearth.jvearth) {
    return;
  }

  vearth.jvearth = date.julian;

  /* calculate heliocentric position of the earth as of a short time ago. */
  t = 0.005;
  keplerCalc({ julian: date.julian - t }, bodies.earth, e, p);

  for (i = 0; i < 3; i++) {
    vearth.vearth[i] = (bodies.earth.position.rect[i] - e[i]) / t;
  }
};

export default vearth;
