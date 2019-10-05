import { RTS, RTD, DTR, TPI } from '../constants'

import { diurnal } from './diurnal'
import { siderial } from './siderial'
import { refraction } from './refraction'
import { transit } from './transit'
import { util } from './util'

export const altaz = {
	azimuth: 0.0,
	elevation: 0.0,
	refracted_elevation: 0.0
};

altaz.calc = (pol, date, body, observer, result) => {
	var dec, cosdec, sindec, lha, coslha, sinlha; // double
	var ra, dist, last, alt, az, coslat, sinlat; // double
	var N, D, x, y, z; // double

	result = result || {};

	ra = pol[0];
	dec = pol[1];
	dist = pol[2];
	/* local apparent siderial time, seconds converted to radians
	 */
	last = siderial.calc( date, observer.tlong ) * DTR / 240.0;
	lha = last - ra; /* local hour angle, radians */
	result.dLocalApparentSiderialTime = last;
	result.localApparentSiderialTime = util.hms (last);

	result.diurnalAberation = diurnal.aberration( last, ra, dec, observer );
	ra = result.diurnalAberation.ra;
	dec = result.diurnalAberation.dec;
	/* Do rise, set, and transit times
	 trnsit.c takes diurnal parallax into account,
	 but not diurnal aberration.  */
	lha = last - ra;
	result.transit = transit.calc( date, lha, dec, body, observer );
	/* Diurnal parallax
	 */
	result.diurnalParallax = diurnal.parallax(last, ra, dec, dist, observer);
	ra = result.diurnalParallax.ra;
	dec = result.diurnalParallax.dec;
	/* Diurnal aberration
	 */
	/*diurab( last, &ra, &dec );*/

	/* Convert ra and dec to altitude and azimuth
	 */
	cosdec = Math.cos(dec);
	sindec = Math.sin(dec);
	lha = last - ra;
	coslha = Math.cos(lha);
	sinlha = Math.sin(lha);

	/* Use the geodetic latitude for altitude and azimuth */
	x = DTR * observer.glat;
	coslat = Math.cos(x);
	sinlat = Math.sin(x);

	N = -cosdec * sinlha;
	D =  sindec * coslat  -  cosdec * coslha * sinlat;
	az = RTD * util.zatan2( D, N );
	alt = sindec * sinlat  +  cosdec * coslha * coslat;
	alt = RTD * Math.asin(alt);

	/* Store results */
	altaz.azimuth = az;
	altaz.elevation = alt; /* Save unrefracted value. */

	/* Correction for atmospheric refraction
	 * unit = degrees
	 */
	D = refraction.calc( alt, observer );
	alt += D;
	altaz.refracted_elevation = alt;

	/* Convert back to R.A. and Dec.
	 */
	y = Math.sin(DTR*alt);
	x = Math.cos(DTR*alt);
	z = Math.cos(DTR*az);
	sinlha = -x * Math.sin(DTR*az);
	coslha = y*coslat - x*z*sinlat;
	sindec = y*sinlat + x*z*coslat;
	lha = util.zatan2( coslha, sinlha );

	y = ra; /* save previous values, before refrac() */
	z = dec;
	dec = Math.asin( sindec );
	ra = last - lha;
	y = ra - y; /* change in ra */
	while( y < - Math.PI ) {
		y += TPI;
	}
	while( y > Math.PI ) {
		y -= TPI;
	}
	y = RTS * y/15.0;
	z = RTS * (dec - z);

	result.atmosphericRefraction = {
		deg: D,
		dRA: y,
		dDec: z
	};

	result.topocentric = {
		altitude: alt,
		azimuth: az,
		ra: ra,
		dec: dec,
		dRA: util.hms (ra),
		dDec: util.dms (dec)
	};

	return result;
};
