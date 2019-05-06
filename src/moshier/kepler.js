$ns.kepler = {};

$ns.kepler.calc = function (date, body, rect, polar) {
	var alat, E, M, W, temp; // double
	var epoch, inclination, ascnode, argperih; // double
	var meandistance, dailymotion, eccent, meananomaly; // double
	var r, coso, sino, cosa; // double

	rect = rect || [];
	polar = polar || [];

	/* Call program to compute position, if one is supplied.  */
	if ( body.ptable ) {
		if ( body.key == 'earth' ) {
			$moshier.gplan.calc3 (date, body.ptable, polar, 3);
		} else {
			$moshier.gplan.calc (date, body.ptable, polar);
		}
		E = polar[0]; /* longitude */
		body.longitude = E;
		W = polar[1]; /* latitude */
		r = polar[2]; /* radius */
		body.distance = r;
		body.epoch = date.julian;
		body.equinox = {julian: $const.j2000};
		// goto kepdon;
	} else {
		/* Decant the parameters from the data structure
		 */
		epoch = body.epoch;
		inclination = body.inclination;
		ascnode = body.node * $const.DTR;
		argperih = body.perihelion;
		meandistance = body.semiAxis; /* semimajor axis */
		dailymotion = body.dailyMotion;
		eccent = body.eccentricity;
		meananomaly = body.anomaly;
		/* Check for parabolic orbit. */
		if( eccent == 1.0 ) {
			/* meandistance = perihelion distance, q
			 * epoch = perihelion passage date
			 */
			temp = meandistance * Math.sqrt (meandistance);
			W = (date.julian - epoch ) * 0.0364911624 / temp;
			/* The constant above is 3 k / sqrt(2),
			 * k = Gaussian gravitational constant = 0.01720209895 . */
			E = 0.0;
			M = 1.0;
			while (Math.abs(M) > 1.0e-11) {
				temp = E * E;
				temp = (2.0 * E * temp + W)/( 3.0 * (1.0 + temp));
				M = temp - E;
				if( temp != 0.0 ) {
					M /= temp;
				}
				E = temp;
			}
			r = meandistance * (1.0 + E * E );
			M = Math.atan (E);
			M = 2.0 * M;
			alat = M + $const.DTR*argperih;
			// goto parabcon;
		} else {
			if( eccent > 1.0 ) {
				/* The equation of the hyperbola in polar coordinates r, theta
				 * is r = a(e^2 - 1)/(1 + e cos(theta))
				 * so the perihelion distance q = a(e-1),
				 * the "mean distance"  a = q/(e-1).
				 */
				meandistance = meandistance/(eccent - 1.0);
				temp = meandistance * Math.sqrt(meandistance);
				W = (date.julian - epoch ) * 0.01720209895 / temp;
				/* solve M = -E + e sinh E */
				E = W/(eccent - 1.0);
				M = 1.0;
				while( Math.abs(M) > 1.0e-11 )
				{
					M = -E + eccent * $util.sinh(E) - W;
					E += M/(1.0 - eccent * $util.cosh(E));
				}
				r = meandistance * (-1.0 + eccent * $util.cosh(E));
				temp = (eccent + 1.0)/(eccent - 1.0);
				M = Math.sqrt(temp) * $util.tanh( 0.5*E );
				M = 2.0 * Math.atan(M);
				alat = M + $const.DTR * argperih;
				// goto parabcon;
			} else {
				/* Calculate the daily motion, if it is not given.
				 */
				if( dailymotion == 0.0 )
				{
					/* The constant is 180 k / pi, k = Gaussian gravitational constant.
					 * Assumes object in heliocentric orbit is massless.
					 */
					dailymotion = 0.9856076686 / (body.semiAxis * Math.sqrt(body.semiAxis));
				}
				dailymotion *= date.julian - epoch;
				/* M is proportional to the area swept out by the radius
				 * vector of a circular orbit during the time between
				 * perihelion passage and Julian date J.
				 * It is the mean anomaly at time J.
				 */
				M = $const.DTR * ( meananomaly + dailymotion );
				M = $util.modtp(M);
				/* If mean longitude was calculated, adjust it also
				 * for motion since epoch of elements.
				 */
				if( body.longitude )
				{
					body.longitude += dailymotion;
					body.longitude = $util.mod360 (body.longitude);
				}

				/* By Kepler's second law, M must be equal to
				 * the area swept out in the same time by an
				 * elliptical orbit of same total area.
				 * Integrate the ellipse expressed in polar coordinates
				 *     r = a(1-e^2)/(1 + e cosW)
				 * with respect to the angle W to get an expression for the
				 * area swept out by the radius vector.  The area is given
				 * by the mean anomaly; the angle is solved numerically.
				 *
				 * The answer is obtained in two steps.  We first solve
				 * Kepler's equation
				 *    M = E - eccent*sin(E)
				 * for the eccentric anomaly E.  Then there is a
				 * closed form solution for W in terms of E.
				 */

				E = M; /* Initial guess is same as circular orbit. */
				temp = 1.0;
				do {
					/* The approximate area swept out in the ellipse */
					temp = E - eccent * Math.sin(E)
						/* ...minus the area swept out in the circle */
						- M;
					/* ...should be zero.  Use the derivative of the error
					 * to converge to solution by Newton's method.
					 */
					E -= temp/(1.0 - eccent * Math.cos(E));
				} while ( Math.abs(temp) > 1.0e-11 );

				/* The exact formula for the area in the ellipse is
				 *    2.0*atan(c2*tan(0.5*W)) - c1*eccent*sin(W)/(1+e*cos(W))
				 * where
				 *    c1 = sqrt( 1.0 - eccent*eccent )
				 *    c2 = sqrt( (1.0-eccent)/(1.0+eccent) ).
				 * Substituting the following value of W
				 * yields the exact solution.
				 */
				temp = Math.sqrt( (1.0+eccent)/(1.0-eccent) );
				W = 2.0 * Math.atan( temp * Math.tan(0.5*E) );

				/* The true anomaly.
				 */
				W = $util.modtp(W);

				meananomaly *= $const.DTR;
				/* Orbital longitude measured from node
				 * (argument of latitude)
				 */
				if( body.longitude ) {
					alat = (body.longitude) * $const.DTR + W - meananomaly - ascnode;
				} else {
					alat = W + $const.DTR * argperih; /* mean longitude not given */
				}

				/* From the equation of the ellipse, get the
				 * radius from central focus to the object.
				 */
				r = meandistance*(1.0-eccent*eccent)/(1.0+eccent*Math.cos(W));
			}
		}
// parabcon:
		/* The heliocentric ecliptic longitude of the object
		 * is given by
		 *   tan( longitude - ascnode )  =  cos( inclination ) * tan( alat ).
		 */
		coso = Math.cos( alat );
		sino = Math.sin( alat );
		inclination *= $const.DTR;
		W = sino * Math.cos( inclination );
		E = $util.zatan2 ( coso, W ) + ascnode;

		/* The ecliptic latitude of the object
		 */
		W = sino * Math.sin( inclination );
		W = Math.asin (W);
	}
// kepdon:

	/* Convert to rectangular coordinates,
	 * using the perturbed latitude.
	 */
	rect[2] = r * Math.sin(W);
	cosa = Math.cos(W);
	rect[1] = r * cosa * Math.sin(E);
	rect[0] = r * cosa * Math.cos(E);

	/* Convert from heliocentric ecliptic rectangular
	 * to heliocentric equatorial rectangular coordinates
	 * by rotating eps radians about the x axis.
	 */
	$moshier.epsilon.calc (body.equinox);
	W = $moshier.epsilon.coseps*rect[1] - $moshier.epsilon.sineps*rect[2];
	M = $moshier.epsilon.sineps*rect[1] + $moshier.epsilon.coseps*rect[2];
	rect[1] = W;
	rect[2] = M;

	/* Precess the position
	 * to ecliptic and equinox of J2000.0
	 * if not already there.
	 */
	$moshier.precess.calc (rect, body.equinox, 1);

	/* If earth, adjust from earth-moon barycenter to earth
	 * by AA page E2.
	 */
	if( body.key == 'earth' ) {
		r = this.embofs ( date, rect); /* see below */
	}

	/* Rotate back into the ecliptic.  */
	$moshier.epsilon.calc ({julian: $const.j2000});
	W = $moshier.epsilon.coseps*rect[1] + $moshier.epsilon.sineps*rect[2];
	M = -$moshier.epsilon.sineps*rect[1] + $moshier.epsilon.coseps*rect[2];

	/* Convert to polar coordinates */
	E = $util.zatan2( rect[0], W );
	W = Math.asin( M/r );

	/* Output the polar cooordinates
	 */
	polar[0] = E; /* longitude */
	polar[1] = W; /* latitude */
	polar[2] = r; /* radius */

	// fill the body.position only if rect and polar are
	// not defined
	if (arguments.length < 4) {
		body.position = {
			date: date,
			rect: rect,
			polar: polar
		};
	}
};

/* Adjust position from Earth-Moon barycenter to Earth
 *
 * J = Julian day number
 * emb = Equatorial rectangular coordinates of EMB.
 * return = Earth's distance to the Sun (au)
 */
$ns.kepler.embofs = function (date, ea) {
	var pm = [], polm = []; // double
	var a, b; // double
	var i; // int

	/* Compute the vector Moon - Earth.  */
	$moshier.gplan.moon (date, pm, polm);

	/* Precess the lunar position
	 * to ecliptic and equinox of J2000.0
	 */
	$moshier.precess.calc (pm, date, 1);

	/* Adjust the coordinates of the Earth
	 */
	a = 1.0 / ($const.emrat +  1.0);
	b = 0.0;
	for( i=0; i<3; i++ ) {
		ea[i] = ea[i] - a * pm[i];
		b = b + ea[i] * ea[i];
	}
	/* Sun-Earth distance.  */
	return Math.sqrt (b);
};

$ns.kepler.init = function () {
	var a, b, fl, co, si, u; // double

	u = $const.glat * $const.DTR;

	/* Reduction from geodetic latitude to geocentric latitude
	 * AA page K5
	 */
	co = Math.cos(u);
	si = Math.sin(u);
	fl = 1.0 - 1.0 / $const.flat;
	fl = fl*fl;
	si = si*si;
	u = 1.0/Math.sqrt( co*co + fl*si );
	a = $const.aearth*u + $const.height;
	b = $const.aearth*fl*u  +  $const.height;
	$const.trho = Math.sqrt( a*a*co*co + b*b*si );
	$const.tlat = $const.RTD * Math.acos( a*co/$const.trho );
	if( $const.glat < 0.0 ) {
		$const.tlat = -$const.tlat;
	}
	$const.trho /= $const.aearth;

	/* Reduction from geodetic latitude to geocentric latitude
	 * AA page K5
	 */
	/*
	 tlat = glat
	 - 0.19242861 * sin(2.0*u)
	 + 0.00032314 * sin(4.0*u)
	 - 0.00000072 * sin(6.0*u);

	 trho =    0.998327073
	 + 0.001676438 * cos(2.0*u)
	 - 0.000003519 * cos(4.0*u)
	 + 0.000000008 * cos(6.0*u);
	 trho += height/6378160.;
	 */

	$const.Clightaud = 86400.0 * $const.Clight / $const.au;
	/* Radius of the earth in au
	 Thanks to Min He <Min.He@businessobjects.com> for pointing out
	 this needs to be initialized early.  */
	$const.Rearth = 0.001 * $const.aearth / $const.au;
};