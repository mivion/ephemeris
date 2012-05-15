$ns.moon = {
	ra: 0.0,	/* Right Ascension */
	dec: 0.0	/* Declination */
};

/* Calculate geometric position of the Moon and apply
 * approximate corrections to find apparent position,
 * phase of the Moon, etc. for AA.ARC.
 */
$ns.moon.calc = function () {
	var i, prtsav; // int
	var ra0, dec0; // double
	var x, y, z, lon0; // double
	var pp = [], qq = [], pe = [], re = [], moonpp = [], moonpol = []; // double

	$moshier.body.moon.position = {
		polar: [],
		rect: []
	};

	/* Geometric equatorial coordinates of the earth.  */
	for (i = 0; i < 3; i++) {
		re [i] = $moshier.body.earth.position.rect [i];
	}

	/* Run the orbit calculation twice, at two different times,
	 * in order to find the rate of change of R.A. and Dec.
	 */

	/* Calculate for 0.001 day ago
	 */
	this.calcll({julian: $moshier.body.earth.position.date.julian - 0.001}, moonpp, moonpol); // TDT - 0.001
	ra0 = this.ra;
	dec0 = this.dec;
	lon0 = moonpol[0];

	/* Calculate for present instant.
	 */
	$moshier.body.moon.position.nutation = this.calcll ($moshier.body.earth.position.date, moonpp, moonpol).nutation;

	$moshier.body.moon.position.geometric = {
		longitude: $const.RTD * $moshier.body.moon.position.polar[0],
		latitude: $const.RTD * $moshier.body.moon.position.polar[1],
		distance: $const.RTD * $moshier.body.moon.position.polar[2]
	};

	/**
	 * The rates of change.  These are used by altaz () to
	 * correct the time of rising, transit, and setting.
	 */
	$const.dradt = this.ra - ra0;
	if ($const.dradt >= Math.PI)
		$const.dradt = $const.dradt - 2.0 * Math.PI;
	if ($const.dradt <= -Math.PI)
		$const.dradt = $const.dradt + 2.0 * Math.PI;
	$const.dradt = 1000.0 * $const.dradt;
	$const.ddecdt = 1000.0*(this.dec-dec0);

	/* Rate of change in longitude, degrees per day
	 * used for phase of the moon
	 */
	lon0 = 1000.0*$const.RTD*(moonpol[0] - lon0);

	/* Get apparent coordinates for the earth.  */
	z = re [0] * re [0] + re [1] * re [1] + re [2] * re [2];
	z = Math.sqrt(z);
	for (i = 0; i < 3; i++) {
		re[i] /= z;
	}

	/* aberration of light. */
	$moshier.body.moon.position.annualAberration = $moshier.aberration.calc (re);

	/* pe[0] -= STR * (20.496/(RTS*pe[2])); */
	$moshier.precess.calc (re, $moshier.body.earth.position.date, -1);
	$moshier.nutation.calc ($moshier.body.earth.position.date, re);
	for (i = 0; i < 3; i++) {
		re[i] *= z;
	}

	$moshier.lonlat.calc ( re, $moshier.body.earth.position.date, pe, 0 );

	/* Find sun-moon-earth angles */
	for( i=0; i<3; i++ ) {
		qq[i] = re[i] + moonpp[i];
	}
	$util.angles ( moonpp, qq, re );

	/* Display answers
	 */
	$moshier.body.moon.position.apparentGeocentric = {
		longitude: moonpol [0],
		dLongitude: $const.RTD * moonpol [0],
		latitude: moonpol [1],
		dLatitude: $const.RTD * moonpol [1],
		distance: moonpol [2] / $const.Rearth
	};
	$moshier.body.moon.position.apparentLongitude = $moshier.body.moon.position.apparentGeocentric.dLongitude;
	var dmsLongitude = $util.dms ($moshier.body.moon.position.apparentGeocentric.longitude);
	$moshier.body.moon.position.apparentLongitudeString =
		dmsLongitude.degree + '\u00B0' +
		dmsLongitude.minutes + '\'' +
		Math.floor (dmsLongitude.seconds) + '"'
	;

	$moshier.body.moon.position.apparentLongitude30String =
		$util.mod30 (dmsLongitude.degree) + '\u00B0' +
		dmsLongitude.minutes + '\'' +
		Math.floor (dmsLongitude.seconds) + '"'
	;

	$moshier.body.moon.position.geocentricDistance = moonpol [2] / $const.Rearth;

	x = $const.Rearth/moonpol[2];
	$moshier.body.moon.position.dHorizontalParallax = Math.asin (x);
	$moshier.body.moon.position.horizontalParallax = $util.dms (Math.asin (x));

	x = 0.272453 * x + 0.0799 / $const.RTS; /* AA page L6 */
	$moshier.body.moon.position.dSemidiameter = x;
	$moshier.body.moon.position.Semidiameter = $util.dms (x);

	x = $const.RTD * Math.acos(-$const.ep);
	/*	x = 180.0 - RTD * arcdot (re, pp); */
	$moshier.body.moon.position.sunElongation = x;
	x = 0.5 * (1.0 + $const.pq);
	$moshier.body.moon.position.illuminatedFraction = x;

	/* Find phase of the Moon by comparing Moon's longitude
	 * with Earth's longitude.
	 *
	 * The number of days before or past indicated phase is
	 * estimated by assuming the true longitudes change linearly
	 * with time.  These rates are estimated for the date, but
	 * do not stay constant.  The error can exceed 0.15 day in 4 days.
	 */
	x = moonpol[0] - pe[0];
	x = $util.modtp ( x ) * $const.RTD;	/* difference in longitude */
	i = Math.floor (x/90);	/* number of quarters */
	x = (x - i*90.0);	/* phase angle mod 90 degrees */

	/* days per degree of phase angle */
	z = moonpol[2]/(12.3685 * 0.00257357);

	if( x > 45.0 ) {
		y = -(x - 90.0)*z;
		$moshier.body.moon.position.phaseDaysBefore = y;
		i = (i+1) & 3;
	} else {
		y = x*z;
		$moshier.body.moon.position.phaseDaysPast = y;
	}

	$moshier.body.moon.position.phaseQuarter = i;

	$moshier.body.moon.position.apparent = {
		dRA: this.ra,
		dDec: this.dec,
		ra: $util.hms (this.ra),
		dec: $util.dms (this.dec)
	};

	/* Compute and display topocentric position (altaz.c)
	 */
	pp[0] = this.ra;
	pp[1] = this.dec;
	pp[2] = moonpol[2];
	$moshier.body.moon.position.altaz = $moshier.altaz.calc (pp, $moshier.body.earth.position.date);
};

/* Calculate apparent latitude, longitude, and horizontal parallax
 * of the Moon at Julian date J.
 */
$ns.moon.calcll = function (date, rect, pol, result) {
	var cosB, sinB, cosL, sinL, y, z; // double
	var qq = [], pp = []; // double
	var i; // int

	result = result || {};

	/* Compute obliquity of the ecliptic, coseps, and sineps.  */
	$moshier.epsilon.calc (date);
	/* Get geometric coordinates of the Moon.  */
	$moshier.gplan.moon (date, rect, pol);
	/* Post the geometric ecliptic longitude and latitude, in radians,
	 * and the radius in au.
	 */
	$const.body.position.polar [0] = pol[0];
	$const.body.position.polar[1] = pol[1];
	$const.body.position.polar[2] = pol[2];

	/* Light time correction to longitude,
	 * about 0.7".
	 */
	pol[0] -= 0.0118 * $const.DTR * $const.Rearth / pol[2];

	/* convert to equatorial system of date */
	cosB = Math.cos(pol[1]);
	sinB = Math.sin(pol[1]);
	cosL = Math.cos(pol[0]);
	sinL = Math.sin(pol[0]);
	rect[0] = cosB*cosL;
	rect[1] = $moshier.epsilon.coseps*cosB*sinL - $moshier.epsilon.sineps*sinB;
	rect[2] = $moshier.epsilon.sineps*cosB*sinL + $moshier.epsilon.coseps*sinB;

	/* Rotate to J2000. */
	$moshier.precess.calc ( rect, {julian: $moshier.body.earth.position.date.julian}, 1 ); // TDT

	/* Find Euclidean vectors and angles between earth, object, and the sun
	 */
	for( i=0; i<3; i++ ) {
		pp[i] = rect[i] * pol[2];
		qq[i] = $moshier.body.earth.position.rect [i] + pp[i];
	}
	$util.angles (pp, qq, $moshier.body.earth.position.rect);

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
	$moshier.precess.calc (rect, {julian: $moshier.body.earth.position.date.julian}, -1); // TDT

	/* Correct for nutation at date TDT.
	 */
	result.nutation = $moshier.nutation.calc ({julian: $moshier.body.earth.position.date.julian}, rect); // TDT

	/* Apparent geocentric right ascension and declination.  */
	this.ra = $util.zatan2(rect[0],rect[1]);
	this.dec = Math.asin(rect[2]);

	/* For apparent ecliptic coordinates, rotate from the true
	 equator into the ecliptic of date.  */
	cosL = Math.cos($moshier.epsilon.eps + $moshier.nutation.nuto);
	sinL  = Math.sin($moshier.epsilon.eps + $moshier.nutation.nuto);
	y = cosL * rect[1] + sinL * rect[2];
	z = -sinL * rect[1] + cosL * rect[2];
	pol[0] = $util.zatan2( rect[0], y );
	pol[1] = Math.asin(z);

	/* Restore earth-moon distance.  */
	for( i=0; i<3; i++ ) {
		rect[i] *= $const.EO;
	}

	return result;
};
