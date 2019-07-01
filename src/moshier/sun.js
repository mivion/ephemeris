import { showcor, showrd, deltap, zatan2, dms, mod30 } from './util';
import { copy } from './common';
import { calc as lonlatCalc } from './lonlat';
import { calc as keplerCalc } from './kepler';
import { calc as precessCalc } from './precess';
import { calc as constellationCalc } from './constellation';
import { calc as altazCalc } from './altaz';
import epsilon, { calc as epsilonCalc } from './epsilon';
import nutation, { calc as nutationCalc } from './nutation';
import constant from './constant';
import bodies from './body';
import variable from './variable';

export const calc = function() {
  bodies.sun.position = bodies.sun.position || {};

  /* Display ecliptic longitude and latitude. */
  const ecr = [];
  for (let i = 0; i < 3; i++) {
    ecr[i] = -bodies.earth.position.rect[i]; //-rearth[i];
  }
  const r = bodies.earth.position.polar[2]; //eapolar [2];

  const pol = [];
  bodies.sun.position.equinoxEclipticLonLat = lonlatCalc(ecr, bodies.earth.position.date, pol, 1); // TDT

  /* Philosophical note: the light time correction really affects
   * only the Sun's barymetric position; aberration is due to
   * the speed of the Earth.  In Newtonian terms the aberration
   * is the same if the Earth is standing still and the Sun moving
   * or vice versa.  Thus the following is actually wrong, but it
   * differs from relativity only in about the 8th decimal.
   * It should be done the same way as the corresponding planetary
   * correction, however.
   */
  pol[2] = r;
  let t;
  for (let i = 0; i < 2; i++) {
    t = pol[2] / 173.1446327;
    /* Find the earth at time TDT - t */
    keplerCalc({ julian: bodies.earth.position.date.julian - t }, bodies.earth, ecr, pol);
  }

  const rec = [];
  for (let i = 0; i < 3; i++) {
    const x = -ecr[i];
    const y = -bodies.earth.position.rect[i]; //-rearth[i];
    ecr[i] = x; /* position t days ago */
    rec[i] = y; /* position now */
    pol[i] = y - x; /* change in position */
  }

  copy(bodies.sun.position, {
    date: bodies.earth.position.date,
    lightTime: 1440.0 * t,
    aberration: showcor(ecr, pol)
  });

  /* Estimate rate of change of RA and Dec for use by altaz(). */
  const d = deltap(ecr, rec); /* see dms.c */
  variable.dradt = d.dr;
  variable.ddecdt = d.dd;
  variable.dradt /= t;
  variable.ddecdt /= t;

  /* There is no light deflection effect.
   * AA page B39.
   */

  /* precess to equinox of date
   */
  precessCalc(ecr, bodies.earth.position.date, -1);

  for (let i = 0; i < 3; i++) {
    rec[i] = ecr[i];
  }

  /* Nutation.
   */
  epsilonCalc(bodies.earth.position.date);
  nutationCalc(bodies.earth.position.date, ecr);

  /* Display the final apparent R.A. and Dec.
   * for equinox of date.
   */
  bodies.sun.position.constellation = constellationCalc(ecr, bodies.earth.position.date);

  bodies.sun.position.apparent = showrd(ecr, pol);

  /* Show it in ecliptic coordinates */
  const y = zatan2(rec[0], epsilon.coseps * rec[1] + epsilon.sineps * rec[2]) + nutation.nutl;
  bodies.sun.position.apparentLongitude = constant.RTD * y;
  const dmsLongitude = dms(y);
  bodies.sun.position.apparentLongitudeString =
    dmsLongitude.degree +
    '\u00B0' +
    dmsLongitude.minutes +
    "'" +
    Math.floor(dmsLongitude.seconds) +
    '"';

  bodies.sun.position.apparentLongitude30String =
    mod30(dmsLongitude.degree) +
    '\u00B0' +
    dmsLongitude.minutes +
    "'" +
    Math.floor(dmsLongitude.seconds) +
    '"';

  bodies.sun.position.geocentricDistance = -1;

  /* Report altitude and azimuth */
  bodies.sun.position.altaz = altazCalc(pol, bodies.earth.position.date);
};
