import { RTD } from '../constants'

import { altaz } from './altaz'
import { constellation } from './constellation'
import Epsilon from './Epsilon'
import { lonlat } from './lonlat'
import { kepler } from './kepler'
import { nutation } from './nutation'
import { precess } from './precess'
import { util } from './util'

export default class Sol {
  constructor(body, earthBody, observer) {
    this._body = this.calculateBody(body, earthBody, observer)

    Object.keys(this._body).forEach(key => {
      this[key] = this._body[key]
    })

    this.calculateBody = this.calculateBody.bind(this)
  }

  calculateBody(body, earthBody, observer) {
  	var r, x, y, t; // double
  	var ecr = [], rec = [], pol = []; // double
  	var i; // int
  	var d;
  	//double asin(), modtp(), sqrt(), cos(), sin();

  	body.position = body.position || {};

  	/* Display ecliptic longitude and latitude.
  	 */
  	for( i=0; i<3; i++ ) {
  		ecr[i] = - earthBody.position.rect[i];//-rearth[i];
  	}
  	r = earthBody.position.polar[2]; //eapolar [2];

  	body.position.equinoxEclipticLonLat = lonlat.calc(ecr, earthBody.position.date, pol, 1); // TDT

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
    let earthTDT = {...earthBody} // clone to prevent mutation
  	for( i=0; i<2; i++ ) {
  		t = pol [2] / 173.1446327;
  		/* Find the earth at time TDT - t */
  		earthTDT = kepler.calc({julian: earthTDT.position.date.julian - t}, earthTDT, ecr, pol );
  	}
  	r = pol[2];

  	for( i=0; i<3; i++ ) {
  		x = -ecr[i];
  		y = - earthTDT.position.rect[i]; //-rearth[i];
  		ecr[i] = x;	/* position t days ago */
  		rec[i] = y;	/* position now */
  		pol[i] = y - x; /* change in position */
  	}

  	body.position = {...body.position, ...{
  		date: earthTDT.position.date,
  		lightTime: 1440.0*t,
  		aberration: util.showcor(ecr, pol)
  	}};

  	/* Estimate rate of change of RA and Dec
  	 * for use by altaz().
  	 */

  	d = util.deltap( ecr, rec);  /* see dms.c */
  	body.locals.dradt = d.dr;
  	body.locals.ddecdt = d.dd;
  	body.locals.dradt /= t;
  	body.locals.ddecdt /= t;

  	/* There is no light deflection effect.
  	 * AA page B39.
  	 */

  	/* precess to equinox of date
  	 */
  	ecr = precess.calc( ecr, earthTDT.position.date.julian, -1);

  	for( i=0; i<3; i++ ) {
  		rec[i] = ecr[i];
  	}

  	/* Nutation.
  	 */
  	let epsilonObject = new Epsilon(earthTDT.position.date.julian);
    let nutationObject = nutation.getObject(earthTDT.position.date)
    nutation.calc(earthTDT.position.date, ecr); // NOTE nutation mutates the nutation object AND returns a result.

  	/* Display the final apparent R.A. and Dec.
  	 * for equinox of date.
  	 */
  	body.position.constellation = constellation.calc(ecr, earthTDT.position.date);

  	body.position.apparent = util.showrd(ecr, pol);

  	/* Show it in ecliptic coordinates */
  	y  =  epsilonObject.coseps * rec[1]  +  epsilonObject.sineps * rec[2];
  	y = util.zatan2( rec[0], y ) + nutationObject.nutl;
  	body.position.apparentLongitude = RTD * y;
  	var dmsLongitude = util.dms (y);
  	body.position.apparentLongitudeString =
  		dmsLongitude.degree + '\u00B0' +
  		dmsLongitude.minutes + '\'' +
  		Math.floor (dmsLongitude.seconds) + '"'
  	;

  	body.position.apparentLongitude30String =
  		util.mod30 (dmsLongitude.degree) + '\u00B0' +
  		dmsLongitude.minutes + '\'' +
  		Math.floor (dmsLongitude.seconds) + '"'
  	;

  	body.position.geocentricDistance = -1;

  	/* Report altitude and azimuth
  	 */
  	body.position.altaz = altaz.calc( pol, earthTDT.position.date, body, observer );

    return body
  }
}
