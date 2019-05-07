import { angles, showrd, mod30 } from './util';
import { calc as keplerCalc } from './kepler';
import { calc as lonlatCalc } from './lonlat';
import { calc as lightCalc } from './light';
import { calc as precessCalc } from './precess';
import { calc as deflectionCalc } from './deflection';
import { calc as aberrationCalc } from './aberration';
import { calc as epsilonCalc } from './epsilon';
import { calc as nutationCalc } from './nutation';
import { calc as constellationCalc } from './constellation';
import { calc as altazCalc } from './altaz';
import constant from './constant';
import bodies from './body';
import variable from './variable';

export const prepare = function(body) {
  if (!body.semiAxis) {
    body.semiAxis = body.perihelionDistance / (1 - body.eccentricity);
  }
};

/* The following program reduces the heliocentric equatorial
 * rectangular coordinates of the earth and object that
 * were computed by kepler() and produces apparent geocentric
 * right ascension and declination.
 */
export const reduce = function(body, q, e) {
  /* Save the geometric coordinates at TDT */
  const temp = [];
  for (let i = 0; i < 3; i++) {
    temp[i] = q[i];
  }

  /* Display ecliptic longitude and latitude, precessed to equinox of date.  */
  const polar = [];
  body.equinoxEclipticLonLat = lonlatCalc(q, bodies.earth.position.date, polar, 1);

  /* Adjust for light time (planetary aberration) */
  lightCalc(body, q, e);

  /* Find Euclidean vectors between earth, object, and the sun */
  const p = [];
  for (let i = 0; i < 3; i++) {
    p[i] = q[i] - e[i];
  }

  angles(p, q, e);

  let a = 0.0;
  for (let i = 0; i < 3; i++) {
    const b = temp[i] - e[i];
    a += b * b;
  }
  a = Math.sqrt(a);
  body.position.trueGeocentricDistance = a; /* was EO */
  body.position.equatorialDiameter = (2.0 * body.semiDiameter) / variable.EO;

  /* Calculate radius. */
  let r = 0.0;
  let x = 0.0;
  for (let i = 0; i < 3; i++) {
    x = p[i];
    r += x * x;
  }
  r = Math.sqrt(r);

  /* Calculate visual magnitude.
   * "Visual" refers to the spectrum of visible light.
   * Phase = 0.5(1+pq) = geometric fraction of disc illuminated.
   * where pq = cos( sun-object-earth angle )
   * The magnitude is
   *    V(1,0) + 2.5 log10( SE^2 SO^2 / Phase)
   * where V(1,0) = elemnt->mag is the magnitude at 1au from
   * both earth and sun and 100% illumination.
   */
  const a1 = 0.5 * (1.0 + variable.pq);
  /* Fudge the phase for light leakage in magnitude estimation.
   * Note this phase term estimate does not reflect reality well.
   * Calculated magnitudes of Mercury and Venus are inaccurate.
   */
  const b = 0.5 * (1.01 + 0.99 * variable.pq);
  const s = body.magnitude + 2.1715 * Math.log(variable.EO * variable.SO) - 1.085 * Math.log(b);
  body.position.approxVisual = {
    magnitude: s,
    phase: a1
  };

  /* Find unit vector from earth in direction of object */
  for (let i = 0; i < 3; i++) {
    p[i] /= variable.EO;
    temp[i] = p[i];
  }

  /* Report astrometric position */
  body.position.astrometricJ2000 = showrd(p, polar);

  /* Also in 1950 coordinates */
  precessCalc(temp, { julian: constant.b1950 }, -1);
  body.position.astrometricB1950 = showrd(temp, polar);

  /* Correct position for light deflection */
  body.position.deflection = deflectionCalc(p, q, e); // relativity

  /* Correct for annual aberration */
  body.position.aberration = aberrationCalc(p);

  /* Precession of the equinox and ecliptic from J2000.0 to ephemeris date */
  precessCalc(p, bodies.earth.position.date, -1);

  /* Ajust for nutation at current ecliptic. */
  epsilonCalc(bodies.earth.position.date);
  body.position.nutation = nutationCalc(bodies.earth.position.date, p);

  /* Display the final apparent R.A. and Dec. for equinox of date. */
  body.position.constellation = constellationCalc(p, bodies.earth.position.date);
  body.position.apparent = showrd(p, polar);

  /* Geocentric ecliptic longitude and latitude.  */
  for (let i = 0; i < 3; i++) {
    p[i] *= variable.EO;
  }
  body.position.apparentGeocentric = lonlatCalc(p, bodies.earth.position.date, temp, 0);
  body.position.apparentLongitude = body.position.apparentGeocentric[0] * constant.RTD;
  body.position.apparentLongitudeString =
    body.position.apparentGeocentric[3].degree +
    '\u00B0' +
    body.position.apparentGeocentric[3].minutes +
    "'" +
    Math.floor(body.position.apparentGeocentric[3].seconds) +
    '"';

  body.position.apparentLongitude30String =
    mod30(body.position.apparentGeocentric[3].degree) +
    '\u00B0' +
    body.position.apparentGeocentric[3].minutes +
    "'" +
    Math.floor(body.position.apparentGeocentric[3].seconds) +
    '"';

  body.position.geocentricDistance = r;

  /* Go do topocentric reductions. */
  polar[2] = variable.EO;
  body.position.altaz = altazCalc(polar, bodies.earth.position.date);
};

export const calc = function(body) {
  prepare(body);
  /* calculate heliocentric position of the object */
  keplerCalc(bodies.earth.position.date, body);
  /* apply correction factors and print apparent place */
  reduce(body, body.position.rect, bodies.earth.position.rect);
};
