import { angles, showrd, dms, mod30 } from './util';
import { calc as fk4fk5Calc } from './fk4fk5';
import { calc as precessCalc } from './precess';
import { calc as deflectionCalc } from './deflection';
import { calc as aberrationCalc } from './aberration';
import { calc as epsilonCalc } from './epsilon';
import { calc as nutationCalc } from './nutation';
import { calc as altazCalc } from './altaz';
import constant from './constant';
import bodies from './body';
import variable from './variable';

export const calc = function(body) {
  if (!body.isPrepared) {
    prepare(body);
    body.isPrepared = true;
  }
  reduce(body);
};

export const reduce = function(body) {
  var p = [],
    q = [],
    e = [],
    m = [],
    temp = [],
    polar = []; // double
  var T, vpi, epoch; // double
  var cosdec, sindec, cosra, sinra; // double
  var i; // int

  /* Convert from RA and Dec to equatorial rectangular direction
   */
  // loop:
  do {
    cosdec = Math.cos(body.dec);
    sindec = Math.sin(body.dec);
    cosra = Math.cos(body.ra);
    sinra = Math.sin(body.ra);
    q[0] = cosra * cosdec;
    q[1] = sinra * cosdec;
    q[2] = sindec;

    /* space motion */
    vpi = 21.094952663 * body.velocity * body.parallax;
    m[0] = -body.raMotion * cosdec * sinra - body.decMotion * sindec * cosra + vpi * q[0];

    m[1] = body.raMotion * cosdec * cosra - body.decMotion * sindec * sinra + vpi * q[1];

    m[2] = body.decMotion * cosdec + vpi * q[2];

    epoch = body.epoch;

    /* Convert FK4 to FK5 catalogue */
    if (epoch == constant.b1950) {
      fk4fk5Calc(q, m, body);
      //goto loop;
    }
  } while (epoch == constant.b1950);

  for (i = 0; i < 3; i++) {
    e[i] = bodies.earth.position.rect[i];
  }

  /* precess the earth to the star epoch */
  precessCalc(e, { julian: epoch }, -1);

  /* Correct for proper motion and parallax
   */
  T = (bodies.earth.position.date.julian - epoch) / 36525.0;
  for (i = 0; i < 3; i++) {
    p[i] = q[i] + T * m[i] - body.parallax * e[i];
  }

  /* precess the star to J2000 */
  precessCalc(p, { julian: epoch }, 1);
  /* reset the earth to J2000 */
  for (i = 0; i < 3; i++) {
    e[i] = bodies.earth.position.rect[i];
  }

  /* Find Euclidean vectors between earth, object, and the sun
   * angles( p, q, e );
   */
  angles(p, p, e);

  /* Find unit vector from earth in direction of object
   */
  for (i = 0; i < 3; i++) {
    p[i] /= variable.EO;
    temp[i] = p[i];
  }

  body.position = {};
  body.position.approxVisualMagnitude = body.magnitude;

  /* Report astrometric position
   */
  body.position.astrimetricJ2000 = showrd(p, polar);

  /* Also in 1950 coordinates
   */
  precessCalc(temp, { julian: constant.b1950 }, -1);

  body.position.astrimetricB1950 = showrd(temp, polar);

  /* For equinox of date: */
  for (i = 0; i < 3; i++) {
    temp[i] = p[i];
  }

  precessCalc(temp, bodies.earth.position.date, -1);
  body.position.astrimetricDate = showrd(temp, polar);

  /* Correct position for light deflection
   * relativity( p, q, e );
   */
  body.position.deflection = deflectionCalc(p, p, e); // relativity

  /* Correct for annual aberration
   */
  body.position.aberration = aberrationCalc(p);

  /* Precession of the equinox and ecliptic
   * from J2000.0 to ephemeris date
   */
  precessCalc(p, bodies.earth.position.date, -1);

  /* Ajust for nutation
   * at current ecliptic.
   */
  epsilonCalc(bodies.earth.position.date);
  nutationCalc(bodies.earth.position.date, p);

  /* Display the final apparent R.A. and Dec.
   * for equinox of date.
   */
  body.position.apparent = showrd(p, polar);

  // prepare for display
  body.position.apparentLongitude = body.position.apparent.dRA;
  var dmsLongitude = dms(body.position.apparentLongitude);
  body.position.apparentLongitudeString =
    dmsLongitude.degree +
    '\u00B0' +
    dmsLongitude.minutes +
    "'" +
    Math.floor(dmsLongitude.seconds) +
    '"';

  body.position.apparentLongitude30String =
    mod30(dmsLongitude.degree) +
    '\u00B0' +
    dmsLongitude.minutes +
    "'" +
    Math.floor(dmsLongitude.seconds) +
    '"';

  body.position.geocentricDistance = 7777;

  /* Go do topocentric reductions. */
  variable.dradt = 0.0;
  variable.ddecdt = 0.0;
  polar[2] = 1.0e38; /* make it ignore diurnal parallax */

  body.position.altaz = altazCalc(polar, bodies.earth.position.date);
};

export const prepare = function(body) {
  var sign; // int
  var x, z; // double

  /* Read in the ASCII string data and name of the object */
  //  sscanf( s, "%lf %lf %lf %lf %lf %lf %lf %lf %lf %lf %lf %lf %s",
  //    &body->epoch, &rh, &rm, &rs, &dd, &dm, &ds,
  //  &body->mura, &body->mudec, &body->v, &body->px, &body->mag, &body->obname[0] );

  x = body.epoch;
  if (x == 2000.0) {
    x = constant.j2000;
  } else if (x == 1950.0) {
    x = constant.b1950;
  } else if (x == 1900.0) {
    x = constant.j1900;
  } else {
    x = constant.j2000 + 365.25 * (x - 2000.0);
  }
  body.epoch = x;

  /* read the right ascension */
  if (!body.ra) {
    body.ra =
      (2.0 *
        Math.PI *
        (3600.0 * body.hmsRa.hours + 60.0 * body.hmsRa.minutes + body.hmsRa.seconds)) /
      86400.0;
  }

  /* read the declination */
  if (!body.dec) {
    sign = 1;

    /* the '-' sign may appaer at any part of hmsDec */
    if (body.hmsDec.hours < 0.0 || body.hmsDec.minutes < 0.0 || body.hmsDec.seconds < 0.0) {
      sign = -1;
    }
    z =
      (3600.0 * Math.abs(body.hmsDec.hours) +
        60.0 * Math.abs(body.hmsDec.minutes) +
        Math.abs(body.hmsDec.seconds)) /
      constant.RTS;
    if (sign < 0) {
      z = -z;
    }
    body.dec = z;
  }

  body.raMotion *= 15.0 / constant.RTS; /* s/century -> "/century -> rad/century */
  body.decMotion /= constant.RTS;
  z = body.parallax;
  if (z < 1.0) {
    if (z <= 0.0) {
      body.parallax = 0.0;
    } else {
      body.parallax = constant.STR * z; /* assume px in arc seconds */
    }
  } else {
    body.parallax = 1.0 / (constant.RTS * z); /* parsecs -> radians */
  }
};
