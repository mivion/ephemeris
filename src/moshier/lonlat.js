$ns.lonlat = {};

$ns.lonlat.calc = function (pp, date, polar, ofdate, result) {
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
		$moshier.precess.calc ( s, date, -1 );
	}

	/* Convert from equatorial to ecliptic coordinates
	 */
	$moshier.epsilon.calc (date);
	yy = s[1];
	zz = s[2];
	x  = s[0];
	y  =  $moshier.epsilon.coseps * yy  +  $moshier.epsilon.sineps * zz;
	z  = -$moshier.epsilon.sineps * yy  +  $moshier.epsilon.coseps * zz;

	yy = $util.zatan2( x, y );
	zz = Math.asin( z / r );

	// longitude and latitude in decimal
	polar[0] = yy;
	polar[1] = zz;
	polar[2] = r;

	// longitude and latitude in h,m,s
	polar [3] = $util.dms (polar[0]);
	polar [4] = $util.dms (polar[1]);

	result [0] = polar [0];
	result [1] = polar [1];
	result [2] = polar [2];
	result [3] = polar [3];
	result [4] = polar [4];

	return result;
};