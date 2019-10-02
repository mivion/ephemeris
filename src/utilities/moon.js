import { DTR, RTD, RTS, REARTH } from '../constants'

import { aberration } from './aberration'
import { altaz } from './altaz'
import Epsilon from './Epsilon'
import { gplan } from './gplan'
import { lonlat } from './lonlat'
import { precess } from './precess'
import { nutation } from './nutation'
import { util } from './util'

export const moon = {
	ra: 0.0,	/* Right Ascension */
	dec: 0.0	/* Declination */
};

/* Calculate geometric position of the Moon and apply
 * approximate corrections to find apparent position,
 * phase of the Moon, etc. for AA.ARC.
 */
moon.calc = (moonBody, earthBody, observer, constant) => {
	var i, prtsav; // int
	var ra0, dec0; // double
	var x, y, z, lon0; // double
	var pp = [], qq = [], pe = [], re = [], moonpp = [], moonpol = []; // double

	moonBody.position = {
		polar: [],
		rect: []
	};

	/* Geometric equatorial coordinates of the earth.  */
	for (i = 0; i < 3; i++) {
		re[i] = earthBody.position.rect [i];
	}

	/* Run the orbit calculation twice, at two different times,
	 * in order to find the rate of change of R.A. and Dec.
	 */

	/* Calculate for 0.001 day ago
	 */


	moon.calcll({julian: earthBody.position.date.julian - 0.001}, moonpp, moonpol, moonBody, earthBody, constant); // TDT - 0.001
	ra0 = moon.ra;
	dec0 = moon.dec;
	lon0 = moonpol[0];
	/* Calculate for present instant.
	 */
	moonBody.position.nutation = moon.calcll(earthBody.position.date, moonpp, moonpol, moonBody, earthBody, constant).nutation;

	moonBody.position.geometric = {
		longitude: RTD * moonBody.position.polar[0],
		latitude: RTD * moonBody.position.polar[1],
		distance: RTD * moonBody.position.polar[2]
	};

	/**
	 * The rates of change.  These are used by altaz () to
	 * correct the time of rising, transit, and setting.
	 */
	constant.dradt = moon.ra - ra0;
	if (constant.dradt >= Math.PI)
		constant.dradt = constant.dradt - 2.0 * Math.PI;
	if (constant.dradt <= -Math.PI)
		constant.dradt = constant.dradt + 2.0 * Math.PI;
	constant.dradt = 1000.0 * constant.dradt;
	constant.ddecdt = 1000.0*(moon.dec-dec0);

	/* Rate of change in longitude, degrees per day
	 * used for phase of the moon
	 */
	lon0 = 1000.0*RTD*(moonpol[0] - lon0);

	/* Get apparent coordinates for the earth.  */
	z = re [0] * re [0] + re [1] * re [1] + re [2] * re [2];
	z = Math.sqrt(z);
	for (i = 0; i < 3; i++) {
		re[i] /= z;
	}

	/* aberration of light. */
	moonBody.position.annualAberration = aberration.calc(re, earthBody, constant);

	/* pe[0] -= STR * (20.496/(RTS*pe[2])); */
	re = precess.calc(re, earthBody.position.date.julian, -1);
	nutation.calc(earthBody.position.date, re); // NOTE mutates re

	for (i = 0; i < 3; i++) {
		re[i] *= z;
	}

	pe = lonlat.calc( re, earthBody.position.date, pe, 0 );

	/* Find sun-moon-earth angles */
	for( i=0; i<3; i++ ) {
		qq[i] = re[i] + moonpp[i];
	}
	constant = util.angles( moonpp, qq, re, constant );

	/* Display answers
	 */

	moonBody.position.apparentGeocentric = {
		longitude: moonpol [0],
		dLongitude: RTD * moonpol [0],
		latitude: moonpol [1],
		dLatitude: RTD * moonpol [1],
		distance: moonpol [2] / REARTH
	};
	moonBody.position.apparentLongitude = moonBody.position.apparentGeocentric.dLongitude;
	var dmsLongitude = util.dms(moonBody.position.apparentGeocentric.longitude);
	moonBody.position.apparentLongitudeString =
		dmsLongitude.degree + '\u00B0' +
		dmsLongitude.minutes + '\'' +
		Math.floor (dmsLongitude.seconds) + '"'
	;

	moonBody.position.apparentLongitude30String =
		util.mod30 (dmsLongitude.degree) + '\u00B0' +
		dmsLongitude.minutes + '\'' +
		Math.floor (dmsLongitude.seconds) + '"'
	;

	moonBody.position.geocentricDistance = moonpol [2] / REARTH;

	x = REARTH/moonpol[2];
	moonBody.position.dHorizontalParallax = Math.asin (x);
	moonBody.position.horizontalParallax = util.dms (Math.asin (x));

	x = 0.272453 * x + 0.0799 / RTS; /* AA page L6 */
	moonBody.position.dSemidiameter = x;
	moonBody.position.Semidiameter = util.dms (x);

	x = RTD * Math.acos(-constant.ep);
	/*	x = 180.0 - RTD * arcdot (re, pp); */
	moonBody.position.sunElongation = x;
	x = 0.5 * (1.0 + constant.pq);
	moonBody.position.illuminatedFraction = x;

	/* Find phase of the Moon by comparing Moon's longitude
	 * with Earth's longitude.
	 *
	 * The number of days before or past indicated phase is
	 * estimated by assuming the true longitudes change linearly
	 * with time.  These rates are estimated for the date, but
	 * do not stay constant.  The error can exceed 0.15 day in 4 days.
	 */
	x = moonpol[0] - pe[0];
	x = util.modtp ( x ) * RTD;	/* difference in longitude */
	i = Math.floor (x/90);	/* number of quarters */
	x = (x - i*90.0);	/* phase angle mod 90 degrees */

	/* days per degree of phase angle */
	z = moonpol[2]/(12.3685 * 0.00257357);

	if( x > 45.0 ) {
		y = -(x - 90.0)*z;
		moonBody.position.phaseDaysBefore = y;
		i = (i+1) & 3;
	} else {
		y = x*z;
		moonBody.position.phaseDaysPast = y;
	}

	moonBody.position.phaseQuarter = i;

	moonBody.position.apparent = {
		dRA: moon.ra,
		dDec: moon.dec,
		ra: util.hms (moon.ra),
		dec: util.dms (moon.dec)
	};

	/* Compute and display topocentric position (altaz.c)
	 */
	pp[0] = moon.ra;
	pp[1] = moon.dec;
	pp[2] = moonpol[2];
	moonBody.position.altaz = altaz.calc(pp, earthBody.position.date, constant, moonBody, observer);

  return moonBody
};

/* Calculate apparent latitude, longitude, and horizontal parallax
 * of the Moon at Julian date J.
 */
moon.calcll = (date, rect, pol, moonBody, earthBody, constant, result) => {
	var cosB, sinB, cosL, sinL, y, z; // double
	var qq = [], pp = []; // double
	var i; // int

	result = result || {};

	/* Compute obliquity of the ecliptic, coseps, and sineps.  */
	const epsilonObject = new Epsilon(date.julian);
	/* Get geometric coordinates of the Moon.  */
	rect = gplan.moon(date, rect, pol);
	/* Post the geometric ecliptic longitude and latitude, in radians,
	 * and the radius in au.
	 */
	moonBody.position.polar[0] = pol[0];
	moonBody.position.polar[1] = pol[1];
	moonBody.position.polar[2] = pol[2];
	/* Light time correction to longitude,
	 * about 0.7".
	 */
	pol[0] -= 0.0118 * DTR * REARTH / pol[2];

	/* convert to equatorial system of date */
	cosB = Math.cos(pol[1]);
	sinB = Math.sin(pol[1]);
	cosL = Math.cos(pol[0]);
	sinL = Math.sin(pol[0]);
	rect[0] = cosB*cosL;
	rect[1] = epsilonObject.coseps*cosB*sinL - epsilonObject.sineps*sinB;
	rect[2] = epsilonObject.sineps*cosB*sinL + epsilonObject.coseps*sinB;

	/* Rotate to J2000. */
	rect = precess.calc( rect, earthBody.position.date.julian, 1 ); // TDT

	/* Find Euclidean vectors and angles between earth, object, and the sun
	 */
	for( i=0; i<3; i++ ) {
		pp[i] = rect[i] * pol[2];
		qq[i] = earthBody.position.rect [i] + pp[i];
	}
	constant = util.angles (pp, qq, earthBody.position.rect, constant);

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
	rect = precess.calc(rect, earthBody.position.date.julian, -1); // TDT

	/* Correct for nutation at date TDT.
	 */
  const nutationObject = nutation.getObject({julian: earthBody.position.date.julian})
	result.nutation = nutation.calc ({julian: earthBody.position.date.julian}, rect); // TDT

	/* Apparent geocentric right ascension and declination.  */
	moon.ra = util.zatan2(rect[0],rect[1]);
	moon.dec = Math.asin(rect[2]);

	/* For apparent ecliptic coordinates, rotate from the true
	 equator into the ecliptic of date.  */

	cosL = Math.cos(epsilonObject.eps + nutationObject.nuto);
	sinL  = Math.sin(epsilonObject.eps + nutationObject.nuto);
	y = cosL * rect[1] + sinL * rect[2];
	z = -sinL * rect[1] + cosL * rect[2];
	pol[0] = util.zatan2( rect[0], y );
	pol[1] = Math.asin(z);

	/* Restore earth-moon distance.  */
	for( i=0; i<3; i++ ) {
		rect[i] *= constant.EO;
	}

	return result;
};
