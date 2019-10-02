import Epsilon from './Epsilon'
import { precess } from './precess'
import { util } from './util'

export const lonlat = {};

lonlat.calc = (pp, date, polar, ofdate, result) => {
  // NOTE mutates polar
  // returns => polar as result
	var s = [], x, y, z, yy, zz, r; // double
	var i; // int

	result = result || {};

	/* Make local copy of position vector
	 * and calculate radius.
	 */
	r = 0.0;
	for( i=0; i<3; i++ ) {
		x = pp [i];
		s [i] = x;
		r += x * x;
	}
	r = Math.sqrt(r);

	/* Precess to equinox of date J
	 */
	if( ofdate ) {
		s = precess.calc( s, date.julian, -1 );
	}

	/* Convert from equatorial to ecliptic coordinates
	 */
	let epsilonObject = new Epsilon(date.julian);
	yy = s[1];
	zz = s[2];
	x  = s[0];
	y  =  epsilonObject.coseps * yy  +  epsilonObject.sineps * zz;
	z  = -epsilonObject.sineps * yy  +  epsilonObject.coseps * zz;

	yy = util.zatan2( x, y );
	zz = Math.asin( z / r );

	// longitude and latitude in decimal
	polar[0] = yy;
	polar[1] = zz;
	polar[2] = r;

	// longitude and latitude in h,m,s
	polar[3] = util.dms(polar[0]);
	polar[4] = util.dms(polar[1]);

	result[0] = polar[0];
	result[1] = polar[1];
	result[2] = polar[2];
	result[3] = polar[3];
	result[4] = polar[4];

	return result;
};
