$ns.planet = {};

$ns.planet.calc = function (body) {
	this.prepare (body);

	/* calculate heliocentric position of the object */
	$moshier.kepler.calc ($moshier.body.earth.position.date, body);
	/* apply correction factors and print apparent place */
	this.reduce (body, body.position.rect, $moshier.body.earth.position.rect);
};

/* The following program reduces the heliocentric equatorial
 * rectangular coordinates of the earth and object that
 * were computed by kepler() and produces apparent geocentric
 * right ascension and declination.
 */
$ns.planet.reduce = function (body, q, e) {
	var p = [], temp = [], polar = []; // double
	var a, b, r, s, x; // double
	var i; // int

	/* Save the geometric coordinates at TDT
	 */
	for ( i=0; i<3; i++ ) {
		temp[i] = q[i];
	}

	/* Display ecliptic longitude and latitude, precessed to equinox
	 of date.  */
	body.equinoxEclipticLonLat = $moshier.lonlat.calc (q, $moshier.body.earth.position.date, polar, 1 );

	/* Adjust for light time (planetary aberration)
	 */
	$moshier.light.calc ( body, q, e );

	/* Find Euclidean vectors between earth, object, and the sun
	 */
	for( i=0; i<3; i++ ) {
		p[i] = q[i] - e[i];
	}

	$util.angles ( p, q, e );

	a = 0.0;
	for( i=0; i<3; i++ ) {
		b = temp[i] - e[i];
		a += b * b;
	}
	a = Math.sqrt(a);
	body.position.trueGeocentricDistance = a; /* was EO */
	body.position.equatorialDiameter = 2.0*body.semiDiameter / $const.EO;

	/* Calculate radius.
	 */
	r = 0.0;
	x = 0.0;
	for( i=0; i<3; i++ ) {
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
	a = 0.5 * (1.0 + $const.pq);
	/* Fudge the phase for light leakage in magnitude estimation.
	 * Note this phase term estimate does not reflect reality well.
	 * Calculated magnitudes of Mercury and Venus are inaccurate.
	 */
	b = 0.5 * (1.01 + 0.99*$const.pq);
	s = body.magnitude + 2.1715 * Math.log( $const.EO*$const.SO ) - 1.085*Math.log(b);
	body.position.approxVisual = {
		magnitude: s,
		phase: a
	};

	/* Find unit vector from earth in direction of object
	 */
	for( i=0; i<3; i++ ) {
		p[i] /= $const.EO;
		temp[i] = p[i];
	}

	/* Report astrometric position
	 */
	body.position.astrometricJ2000 = $util.showrd (p, polar );

	/* Also in 1950 coordinates
	 */
	$moshier.precess.calc ( temp, {julian: $const.b1950}, -1 );
	body.position.astrometricB1950 = $util.showrd (temp, polar );

	/* Correct position for light deflection
	 */
	body.position.deflection = $moshier.deflectioon.calc ( p, q, e ); // relativity

	/* Correct for annual aberration
	 */
	body.position.aberration = $moshier.aberration.calc (p);

	/* Precession of the equinox and ecliptic
	 * from J2000.0 to ephemeris date
	 */
	$moshier.precess.calc ( p, $moshier.body.earth.position.date, -1 );

	/* Ajust for nutation
	 * at current ecliptic.
	 */
	$moshier.epsilon.calc ( $moshier.body.earth.position.date );
	body.position.nutation = $moshier.nutation.calc ( $moshier.body.earth.position.date, p );

	/* Display the final apparent R.A. and Dec.
	 * for equinox of date.
	 */
	body.position.constellation = $moshier.constellation.calc (p, $moshier.body.earth.position.date);
	body.position.apparent = $util.showrd (p, polar);

	/* Geocentric ecliptic longitude and latitude.  */
	for( i=0; i<3; i++ ) {
		p[i] *= $const.EO;
	}
	body.position.apparentGeocentric = $moshier.lonlat.calc ( p, $moshier.body.earth.position.date, temp, 0 );
	body.position.apparentLongitude = body.position.apparentGeocentric [0] * $const.RTD;
	body.position.apparentLongitudeString =
		body.position.apparentGeocentric [3].degree + '\u00B0' +
		body.position.apparentGeocentric [3].minutes + '\'' +
		Math.floor (body.position.apparentGeocentric [3].seconds) + '"'
	;

	body.position.apparentLongitude30String =
		$util.mod30 (body.position.apparentGeocentric [3].degree) + '\u00B0' +
		body.position.apparentGeocentric [3].minutes + '\'' +
		Math.floor (body.position.apparentGeocentric [3].seconds) + '"'
	;

	body.position.geocentricDistance = r;

	/* Go do topocentric reductions.
	 */
	polar[2] = $const.EO;
	body.position.altaz = $moshier.altaz.calc (polar, $moshier.body.earth.position.date);
};

$ns.planet.prepare = function (body) {
	if (!body.semiAxis) {
		body.semiAxis = body.perihelionDistance / (1 - body.eccentricity);
	}
};
