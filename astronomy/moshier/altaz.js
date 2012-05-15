$ns.altaz = {
	azimuth: 0.0,
	elevation: 0.0,
	refracted_elevation: 0.0
};

$ns.altaz.calc = function (pol, date, result) {
	var dec, cosdec, sindec, lha, coslha, sinlha; // double
	var ra, dist, last, alt, az, coslat, sinlat; // double
	var N, D, x, y, z, TPI; // double

	result = result || {};

	ra = pol[0];
	dec = pol[1];
	dist = pol[2];
	TPI = 2.0*Math.PI;

	/* local apparent sidereal time, seconds converted to radians
	 */
	last = $moshier.siderial.calc ( date, $const.tlong ) * $const.DTR/240.0;
	lha = last - ra; /* local hour angle, radians */
	result.dLocalApparentSiderialTime = last;
	result.localApparentSiderialTime = $util.hms (last);

	/* Display rate at which ra and dec are changing
	 */
	/*
	 *if( prtflg )
	 *	{
	 *	x = RTS/24.0;
	 *	N = x*dradt;
	 *	D = x*ddecdt;
	 *	if( N != 0.0 )
	 *		printf( "dRA/dt %.2f\"/h, dDec/dt %.2f\"/h\n", N, D );
	 *	}
	 */

	result.diurnalAberation = $moshier.diurnal.aberration ( last, ra, dec );
	ra = result.diurnalAberation.ra;
	dec = result.diurnalAberation.dec;

	/* Do rise, set, and transit times
	 trnsit.c takes diurnal parallax into account,
	 but not diurnal aberration.  */
	lha = last - ra;
	result.transit = $moshier.transit.calc ( date, lha, dec );

	/* Diurnal parallax
	 */
	result.diurnalParallax = $moshier.diurnal.parallax (last, ra, dec, dist);
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
	x = $const.DTR * $const.glat;
	coslat = Math.cos(x);
	sinlat = Math.sin(x);

	N = -cosdec * sinlha;
	D =  sindec * coslat  -  cosdec * coslha * sinlat;
	az = $const.RTD * $util.zatan2( D, N );
	alt = sindec * sinlat  +  cosdec * coslha * coslat;
	alt = $const.RTD * Math.asin(alt);

	/* Store results */
	this.azimuth = az;
	this.elevation = alt; /* Save unrefracted value. */

	/* Correction for atmospheric refraction
	 * unit = degrees
	 */
	D = $moshier.refraction.calc ( alt );
	alt += D;
	this.refracted_elevation = alt;

	/* Convert back to R.A. and Dec.
	 */
	y = Math.sin($const.DTR*alt);
	x = Math.cos($const.DTR*alt);
	z = Math.cos($const.DTR*az);
	sinlha = -x * Math.sin($const.DTR*az);
	coslha = y*coslat - x*z*sinlat;
	sindec = y*sinlat + x*z*coslat;
	lha = $util.zatan2( coslha, sinlha );

	y = ra; /* save previous values, before refrac() */
	z = dec;
	dec = Math.asin( sindec );
	ra = last - lha;
	y = ra - y; /* change in ra */
	while( y < - Math.PI ) {
		y += $const.TPI;
	}
	while( y > Math.PI ) {
		y -= $const.TPI;
	}
	y = $const.RTS*y/15.0;
	z = $const.RTS*(dec - z);

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
		dRA: $util.hms (ra),
		dDec: $util.dms (dec)
	};

	return result;
};