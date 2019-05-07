import { zatan2, dms } from './util';
import { calc as precessCalc } from './precess';
import epsilon, { calc as epsilonCalc } from './epsilon';

export const calc = function(pp, date, polar, ofdate, result) {
  result = result || {};

  /* Make local copy of position vector and calculate radius. */
  const s = [];
  let r = 0.0;
  for (let i = 0; i < 3; i++) {
    const x = pp[i];
    s[i] = x;
    r += x * x;
  }
  r = Math.sqrt(r);

  /* Precess to equinox of date J */
  if (ofdate) {
    precessCalc(s, date, -1);
  }

  /* Convert from equatorial to ecliptic coordinates */
  epsilonCalc(date);
  const yy = s[1];
  const zz = s[2];
  const x = s[0];
  const y = epsilon.coseps * yy + epsilon.sineps * zz;
  const z = -epsilon.sineps * yy + epsilon.coseps * zz;

  // longitude and latitude in decimal
  polar[0] = zatan2(x, y);
  polar[1] = Math.asin(z / r);
  polar[2] = r;

  // longitude and latitude in h,m,s
  polar[3] = dms(polar[0]);
  polar[4] = dms(polar[1]);

  result[0] = polar[0];
  result[1] = polar[1];
  result[2] = polar[2];
  result[3] = polar[3];
  result[4] = polar[4];

  return result;
};
