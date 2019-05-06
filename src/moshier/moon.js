import { angles, mod30, modtp, hms, dms, zatan2 } from './util';
import { calc as aberrationCalc } from './aberration';
import { calc as precessCalc } from './precess';
import { calc as lonlatCalc } from './lonlat';
import { calc as altazCalc } from './altaz';
import { moon as gplanMoon } from './gplan';
import epsilon, { calc as epsilonCalc } from './epsilon';
import nutation, { calc as nutationCalc } from './nutation';
import constant from './constant';
import bodies from './body';
import variable from './variable';

const moon = {
  ra: 0.0 /* Right Ascension */,
  dec: 0.0 /* Declination */
};

/* Calculate geometric position of the Moon and apply
 * approximate corrections to find apparent position,
 * phase of the Moon, etc. for AA.ARC.
 */
export const calc = function() {
  var i; // int
  var ra0, dec0; // double
  var x, y, z /*, lon0 */; // double
  var pp = [],
    qq = [],
    pe = [],
    re = [],
    moonpp = [],
    moonpol = []; // double

  bodies.moon.position = {
    polar: [],
    rect: []
  };

  /* Geometric equatorial coordinates of the earth.  */
  for (i = 0; i < 3; i++) {
    re[i] = bodies.earth.position.rect[i];
  }

  /* Run the orbit calculation twice, at two different times,
   * in order to find the rate of change of R.A. and Dec.
   */

  /* Calculate for 0.001 day ago
   */
  calcll({ julian: bodies.earth.position.date.julian - 0.001 }, moonpp, moonpol); // TDT - 0.001
  ra0 = moon.ra;
  dec0 = moon.dec;
  // UNUSED: lon0 = moonpol[0];

  /* Calculate for present instant. */
  bodies.moon.position.nutation = calcll(bodies.earth.position.date, moonpp, moonpol).nutation;

  bodies.moon.position.geometric = {
    longitude: constant.RTD * bodies.moon.position.polar[0],
    latitude: constant.RTD * bodies.moon.position.polar[1],
    distance: constant.RTD * bodies.moon.position.polar[2]
  };

  /* The rates of change.  These are used by altaz () to correct the time of rising, transit, and setting. */
  variable.dradt = moon.ra - ra0;
  if (variable.dradt >= Math.PI) variable.dradt = variable.dradt - 2.0 * Math.PI;
  if (variable.dradt <= -Math.PI) variable.dradt = variable.dradt + 2.0 * Math.PI;
  variable.dradt = 1000.0 * variable.dradt;
  variable.ddecdt = 1000.0 * (moon.dec - dec0);

  /* Rate of change in longitude, degrees per day used for phase of the moon */
  // UNUSED: lon0 = 1000.0 * RTD * (moonpol[0] - lon0);

  /* Get apparent coordinates for the earth.  */
  z = re[0] * re[0] + re[1] * re[1] + re[2] * re[2];
  z = Math.sqrt(z);
  for (i = 0; i < 3; i++) {
    re[i] /= z;
  }

  /* aberration of light. */
  bodies.moon.position.annualAberration = aberrationCalc(re);

  /* pe[0] -= STR * (20.496/(RTS*pe[2])); */
  precessCalc(re, bodies.earth.position.date, -1);
  nutationCalc(bodies.earth.position.date, re);
  for (i = 0; i < 3; i++) {
    re[i] *= z;
  }

  lonlatCalc(re, bodies.earth.position.date, pe, 0);

  /* Find sun-moon-earth angles */
  for (i = 0; i < 3; i++) {
    qq[i] = re[i] + moonpp[i];
  }
  angles(moonpp, qq, re);

  /* Display answers */
  bodies.moon.position.apparentGeocentric = {
    longitude: moonpol[0],
    dLongitude: constant.RTD * moonpol[0],
    latitude: moonpol[1],
    dLatitude: constant.RTD * moonpol[1],
    distance: moonpol[2] / constant.Rearth
  };
  bodies.moon.position.apparentLongitude = bodies.moon.position.apparentGeocentric.dLongitude;
  var dmsLongitude = dms(bodies.moon.position.apparentGeocentric.longitude);
  bodies.moon.position.apparentLongitudeString =
    dmsLongitude.degree +
    '\u00B0' +
    dmsLongitude.minutes +
    "'" +
    Math.floor(dmsLongitude.seconds) +
    '"';

  bodies.moon.position.apparentLongitude30String =
    mod30(dmsLongitude.degree) +
    '\u00B0' +
    dmsLongitude.minutes +
    "'" +
    Math.floor(dmsLongitude.seconds) +
    '"';

  bodies.moon.position.geocentricDistance = moonpol[2] / constant.Rearth;

  x = constant.Rearth / moonpol[2];
  bodies.moon.position.dHorizontalParallax = Math.asin(x);
  bodies.moon.position.horizontalParallax = dms(Math.asin(x));

  x = 0.272453 * x + 0.0799 / constant.RTS; /* AA page L6 */
  bodies.moon.position.dSemidiameter = x;
  bodies.moon.position.Semidiameter = dms(x);

  x = constant.RTD * Math.acos(-variable.ep);
  /*	x = 180.0 - RTD * arcdot (re, pp); */
  bodies.moon.position.sunElongation = x;
  x = 0.5 * (1.0 + variable.pq);
  bodies.moon.position.illuminatedFraction = x;

  /* Find phase of the Moon by comparing Moon's longitude
   * with Earth's longitude.
   *
   * The number of days before or past indicated phase is
   * estimated by assuming the true longitudes change linearly
   * with time.  These rates are estimated for the date, but
   * do not stay constant.  The error can exceed 0.15 day in 4 days.
   */
  x = moonpol[0] - pe[0];
  x = modtp(x) * constant.RTD; /* difference in longitude */
  i = Math.floor(x / 90); /* number of quarters */
  x = x - i * 90.0; /* phase angle mod 90 degrees */

  /* days per degree of phase angle */
  z = moonpol[2] / (12.3685 * 0.00257357);

  if (x > 45.0) {
    y = -(x - 90.0) * z;
    bodies.moon.position.phaseDaysBefore = y;
    i = (i + 1) & 3;
  } else {
    y = x * z;
    bodies.moon.position.phaseDaysPast = y;
  }

  bodies.moon.position.phaseQuarter = i;

  bodies.moon.position.apparent = {
    dRA: moon.ra,
    dDec: moon.dec,
    ra: hms(moon.ra),
    dec: dms(moon.dec)
  };

  /* Compute and display topocentric position (altaz.c) */
  pp[0] = moon.ra;
  pp[1] = moon.dec;
  pp[2] = moonpol[2];
  bodies.moon.position.altaz = altazCalc(pp, bodies.earth.position.date);
};

/* Calculate apparent latitude, longitude, and horizontal parallax
 * of the Moon at Julian date J.
 */
export const calcll = function(date, rect, pol, result) {
  var cosB, sinB, cosL, sinL, y, z; // double
  var qq = [],
    pp = []; // double
  var i; // int

  result = result || {};

  /* Compute obliquity of the ecliptic, coseps, and sineps.  */
  epsilonCalc(date);
  /* Get geometric coordinates of the Moon.  */
  gplanMoon(date, rect, pol);
  /* Post the geometric ecliptic longitude and latitude, in radians,
   * and the radius in au.
   */
  variable.body.position.polar[0] = pol[0];
  variable.body.position.polar[1] = pol[1];
  variable.body.position.polar[2] = pol[2];

  /* Light time correction to longitude,
   * about 0.7".
   */
  pol[0] -= (0.0118 * constant.DTR * constant.Rearth) / pol[2];

  /* convert to equatorial system of date */
  cosB = Math.cos(pol[1]);
  sinB = Math.sin(pol[1]);
  cosL = Math.cos(pol[0]);
  sinL = Math.sin(pol[0]);
  rect[0] = cosB * cosL;
  rect[1] = epsilon.coseps * cosB * sinL - epsilon.sineps * sinB;
  rect[2] = epsilon.sineps * cosB * sinL + epsilon.coseps * sinB;

  /* Rotate to J2000. */
  precessCalc(rect, { julian: bodies.earth.position.date.julian }, 1); // TDT

  /* Find Euclidean vectors and angles between earth, object, and the sun
   */
  for (i = 0; i < 3; i++) {
    pp[i] = rect[i] * pol[2];
    qq[i] = bodies.earth.position.rect[i] + pp[i];
  }
  angles(pp, qq, bodies.earth.position.rect);

  /* Make rect a unit vector.  */
  /* for (i = 0; i < 3; i++) */
  /*  rect[i] /= EO; */

  /* Correct position for light deflection.
	 (Ignore.)  */
  /* relativity( rect, qq, rearth ); */

  /* Aberration of light.
	 The Astronomical Almanac (Section D, Daily Polynomial Coefficients)
	 seems to omit this, even though the reference ephemeris is inertial.  */
  /* annuab (rect); */

  /* Precess to date.  */
  precessCalc(rect, { julian: bodies.earth.position.date.julian }, -1); // TDT

  /* Correct for nutation at date TDT.
   */
  result.nutation = nutationCalc({ julian: bodies.earth.position.date.julian }, rect); // TDT

  /* Apparent geocentric right ascension and declination.  */
  moon.ra = zatan2(rect[0], rect[1]);
  moon.dec = Math.asin(rect[2]);

  /* For apparent ecliptic coordinates, rotate from the true
	 equator into the ecliptic of date.  */
  cosL = Math.cos(epsilon.eps + nutation.nuto);
  sinL = Math.sin(epsilon.eps + nutation.nuto);
  y = cosL * rect[1] + sinL * rect[2];
  z = -sinL * rect[1] + cosL * rect[2];
  pol[0] = zatan2(rect[0], y);
  pol[1] = Math.asin(z);

  /* Restore earth-moon distance.  */
  for (i = 0; i < 3; i++) {
    rect[i] *= variable.EO;
  }

  return result;
};

export default moon;
