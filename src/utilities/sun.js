import { RTD } from '../constants'

import { altaz } from './altaz'
import { constellation } from './constellation'
import Epsilon from './Epsilon'
import { lonlat } from './lonlat'
import { kepler } from './kepler'
import { nutation } from './nutation'
import { precess } from './precess'
import { util } from './util'
export const sun = {};

sun.calc = (sunBodyObject, earthBodyObject, constant) => {
	var r, x, y, t; // double
	var ecr = [], rec = [], pol = []; // double
	var i; // int
	var d;
	//double asin(), modtp(), sqrt(), cos(), sin();

	sunBodyObject.position = sunBodyObject.position || {};

	/* Display ecliptic longitude and latitude.
	 */
	for( i=0; i<3; i++ ) {
		ecr[i] = - earthBodyObject.position.rect[i];//-rearth[i];
	}
	r = earthBodyObject.position.polar[2]; //eapolar [2];

	sunBodyObject.position.equinoxEclipticLonLat = lonlat.calc(ecr, earthBodyObject.position.date, pol, 1); // TDT

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
	for( i=0; i<2; i++ ) {
		t = pol [2] / 173.1446327;
		/* Find the earth at time TDT - t */
		earthBodyObject = kepler.calc({julian: earthBodyObject.position.date.julian - t}, earthBodyObject, ecr, pol );
	}
	r = pol[2];

	for( i=0; i<3; i++ ) {
		x = -ecr[i];
		y = - earthBodyObject.position.rect[i]; //-rearth[i];
		ecr[i] = x;	/* position t days ago */
		rec[i] = y;	/* position now */
		pol[i] = y - x; /* change in position */
	}

	sunBodyObject.position = {...sunBodyObject.position, ...{
		date: earthBodyObject.position.date,
		lightTime: 1440.0*t,
		aberration: util.showcor(ecr, pol)
	}};

	/* Estimate rate of change of RA and Dec
	 * for use by altaz().
	 */

	d = util.deltap( ecr, rec);  /* see dms.c */
	constant.dradt = d.dr;
	constant.ddecdt = d.dd;
	constant.dradt /= t;
	constant.ddecdt /= t;

	/* There is no light deflection effect.
	 * AA page B39.
	 */

	/* precess to equinox of date
	 */
	ecr = precess.calc( ecr, earthBodyObject.position.date.julian, -1);

	for( i=0; i<3; i++ ) {
		rec[i] = ecr[i];
	}

	/* Nutation.
	 */
	let epsilonObject = new Epsilon(earthBodyObject.position.date.julian);
  let nutationObject = nutation.getObject(earthBodyObject.position.date)
  nutation.calc(earthBodyObject.position.date, ecr); // NOTE nutation mutates the nutation object AND returns a result.

	/* Display the final apparent R.A. and Dec.
	 * for equinox of date.
	 */
	sunBodyObject.position.constellation = constellation.calc(ecr, earthBodyObject.position.date);

	sunBodyObject.position.apparent = util.showrd(ecr, pol);

	/* Show it in ecliptic coordinates */
	y  =  epsilonObject.coseps * rec[1]  +  epsilonObject.sineps * rec[2];
	y = util.zatan2( rec[0], y ) + nutationObject.nutl;
	sunBodyObject.position.apparentLongitude = RTD * y;
	var dmsLongitude = util.dms (y);
	sunBodyObject.position.apparentLongitudeString =
		dmsLongitude.degree + '\u00B0' +
		dmsLongitude.minutes + '\'' +
		Math.floor (dmsLongitude.seconds) + '"'
	;

	sunBodyObject.position.apparentLongitude30String =
		util.mod30 (dmsLongitude.degree) + '\u00B0' +
		dmsLongitude.minutes + '\'' +
		Math.floor (dmsLongitude.seconds) + '"'
	;

	sunBodyObject.position.geocentricDistance = -1;

	/* Report altitude and azimuth
	 */
	sunBodyObject.position.altaz = altaz.calc( pol, earthBodyObject.position.date, constant, sunBodyObject );

  return sunBodyObject
};
