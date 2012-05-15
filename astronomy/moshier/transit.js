$ns.transit = {
	/* Earth radii per au */
	DISFAC: 2.3454780e4,

	/* cosine of 90 degrees 50 minutes: */
	COSSUN: -0.014543897651582657,
	/* cosine of 90 degrees 34 minutes: */
	COSZEN: -9.8900378587411476e-3,

	/* Returned transit, rise, and set times in radians (2 pi = 1 day) */
	r_trnsit: 0.0,
	r_rise: 0.0,
	r_set: 0.0,
	elevation_threshold: 0.0,
	semidiameter: 0.0,
	f_trnsit: 0, // int
	southern_hemisphere: 0, // int

	/* Julian dates of rise, transet and set times.  */
	t_rise: 0.0,
	t_trnsit: 0.0,
	elevation_trnsit: 0.0,
	t_set: 0.0,

	STEP_SCALE: 0.5
};

/* Calculate time of transit
 * assuming RA and Dec change uniformly with time
 */
$ns.transit.calc = function (date, lha, dec, result) {
	var x, y, z, N, D; // double
	var lhay, cosdec, sindec, coslat, sinlat; // double

	result = result || {};

	this.f_trnsit = 0;
	/* Initialize to no-event flag value. */
	this.r_rise = -10.0;
	this.r_set = -10.0;
	/* observer's geodetic latitude, in radians */
	x = $const.glat * $const.DTR;
	coslat = Math.cos(x);
	sinlat = Math.sin(x);

	cosdec = Math.cos(dec);
	sindec = Math.sin(dec);

	if (sinlat < 0) {
		this.southern_hemisphere = 1;
	} else {
		this.southern_hemisphere = 0;
	}

	/* Refer to same start of date as iter_trnsit,
	 so r_trnsit means the same thing in both programs.  */
	x = Math.floor(date.universal - 0.5) + 0.5; // UT
	x = (date.universal - x) * $const.TPI; // UT
	/* adjust local hour angle */
	y = lha;
	/* printf ("%.7f,", lha); */
	while( y < -Math.PI ) {
		y += $const.TPI;
	}
	while( y > Math.PI ) {
		y -= $const.TPI;
	}
	lhay = y;
	y =  y/( -$const.dradt/$const.TPI + 1.00273790934);
	this.r_trnsit = x - y;
	/* printf ("rt %.7f ", r_trnsit); */
	/* Ordinarily never print here.  */
	result.approxLocalMeridian = $util.hms (this.r_trnsit);
	result.UTdate = this.r_trnsit/$const.TPI;

	if( !((coslat == 0.0) || (cosdec == 0.0)) ) {
		/* The time at which the upper limb of the body meets the
		 * horizon depends on the body's angular diameter.
		 */
		switch( $const.body.key ) {
			/* Sun */
			case 'sun':
				N = this.COSSUN;
				this.semidiameter = 0.2666666666666667;
				this.elevation_threshold = -0.8333333333333333;
				break;

			/* Moon, elevation = -34' - semidiameter + parallax
			 * semidiameter = 0.272453 * parallax + 0.0799"
			 */
			case 'moon':
				N = 1.0/(this.DISFAC*$const.body.position.polar [2]);
				D = Math.asin( N ); /* the parallax */
				this.semidiameter = 0.2725076*D + 3.874e-7;
				N =  -9.890199094634534e-3 - this.semidiameter + D;
				this.semidiameter *= $const.RTD;
				this.elevation_threshold = -34.0/60.0 - this.semidiameter;
				N = Math.sin(N);
				break;

			/* Other object */
			default:
				N = this.COSZEN;
				this.semidiameter = 0.0;
				this.elevation_threshold = -0.5666666666666666;
				break;
		}
		y = (N - sinlat*sindec)/(coslat*cosdec);

		if( (y < 1.0) && (y > -1.0) )
		{
			this.f_trnsit = 1;
			/* Derivative of y with respect to declination
			 * times rate of change of declination:
			 */
			z = -$const.ddecdt*(sinlat + this.COSZEN*sindec);
			z /= $const.TPI*coslat*cosdec*cosdec;
			/* Derivative of acos(y): */
			z /= Math.sqrt( 1.0 - y*y);
			y = Math.acos(y);
			D = -$const.dradt/$const.TPI + 1.00273790934;
			this.r_rise = x - (lhay + y)*(1.0 + z)/D;
			this.r_set = x - (lhay - y)*(1.0 - z)/D;
			/* Ordinarily never print here.  */

			result.dApproxRiseUT = this.r_rise;
			result.dApproxSetUT = this.r_set;
			result.approxRiseUT = $util.hms (this.r_rise);
			result.approxSetUT = $util.hms (this.r_set);
		}
	}
	return result;
};

/* Compute estimate of lunar rise and set times for iterative solution.  */
$ns.transit.iterator = function (julian, callback) {
	var date = {
		julian: julian
	};

	$moshier.toGregorian (date);
	$moshier.julian.calc (date);
	$moshier.delta.calc (date);

	$moshier.kepler (date, $moshier.body.earth);

	callback ();
};

/* Iterative computation of rise, transit, and set times.  */
$ns.transit.iterateTransit = function (callback, result) {
	//var JDsave, TDTsave, UTsave; // double
	var date, date_trnsit, t0, t1; // double
	var rise1, set1, trnsit1, loopctr, retry; // double
	var isPrtrnsit = false;

	result = result || {};

	loopctr = 0;
	//JDsave = JD;
	//TDTsave = TDT;
	//UTsave = UT;
	retry = 0;
	/* Start iteration at time given by the user.  */
	t1 = $moshier.body.earth.position.date.universal; // UT

	/* Find transit time. */
	do {
		t0 = t1;
		date = Math.floor (t0 - 0.5) + 0.5;
		this.iterator (t0, callback);
		t1 = date + this.r_trnsit / $const.TPI;
		if (++loopctr > 10) {
			break;
			// goto no_trnsit;
		}
	} while (Math.abs (t1 - t0) > .0001);

	if (!(loopctr > 10)) {
		this.t_trnsit = t1;
		this.elevation_trnsit = $moshier.altaz.elevation;
		trnsit1 = this.r_trnsit;
		set1 = this.r_set;
		if (this.f_trnsit == 0) {
			/* Rise or set time not found.  Apply a search technique to
			 check near inferior transit if object is above horizon now.  */
			this.t_rise = -1.0;
			this.t_set = -1.0;
			if ($moshier.altaz.elevation > this.elevation_threshold) {
				this.noRiseSet (this.t_trnsit, callback);
			}
			// goto prtrnsit;
		} else {
			/* Set current date to be that of the transit just found.  */
			date_trnsit = date;
			t1 = date + this.r_rise / $const.TPI;
			/* Choose rising no later than transit.  */
			if (t1 >= this.t_trnsit) {
				date -= 1.0;
				t1 = date + this.r_rise / $const.TPI;
			}
			loopctr = 0;
			do {
				t0 = t1;
				this.iterator (t0, callback);
				/* Skip out if no event found.  */
				if (this.f_trnsit == 0) {
					/* Rise or set time not found.  Apply search technique.  */
					this.t_rise = -1.0;
					this.t_set = -1.0;
					this.noRiseSet (this.t_trnsit, callback);
					isPrtrnsit = true;
					// goto prtrnsit;
				} else {
					if (++loopctr > 10) {
						// Rise time did not converge
						this.f_trnsit = 0;
						isPrtrnsit = true;
						// goto prtrnsit;
					} else {
						t1 = date + this.r_rise / $const.TPI;
						if (t1 > this.t_trnsit) {
							date -= 1;
							t1 = date + this.r_rise / $const.TPI;
						}
					}
				}
			} while (Math.abs (t1 - t0) > .0001);

			if (!isPrtrnsit) {
				isPrtrnsit = false;
				rise1 = this.r_rise;
				this.t_rise = t1;

				/* Set current date to be that of the transit.  */
				date = date_trnsit;
				this.r_set = set1;
				/* Choose setting no earlier than transit.  */
				t1 = date + this.r_set / $const.TPI;
				if (t1 <= this.t_trnsit) {
					date += 1.0;
					t1 = date + this.r_set / $const.TPI;
				}
				loopctr = 0;
				do {
					t0 = t1;
					this.iterator (t0, callback);
					if (this.f_trnsit == 0) {
						/* Rise or set time not found.  Apply search technique.  */
						this.t_rise = -1.0;
						this.t_set = -1.0;
						this.noRiseSet (this.t_trnsit, callback);
						isPrtrnsit = true;
						//goto prtrnsit;
					} else {
						if (++loopctr > 10) {
							// Set time did not converge
							this.f_trnsit = 0;
							isPrtrnsit = true;
							//goto prtrnsit;
						} else {
							t1 = date + this.r_set / $const.TPI;
							if (t1 < this.t_trnsit) {
								date += 1.0;
								t1 = date + this.r_set / $const.TPI;
							}
						}
					}
				} while (fabs(t1 - t0) > .0001);

				if (!isPrtrnsit) {
					this.t_set = t1;
					this.r_trnsit = trnsit1;
					this.r_rise = rise1;
				}
			}
		}
// prtrnsit:
		result.localMeridianTransit = $moshier.julian.toGregorian ({julian: this.t_trnsit});
		if (this.t_rise != -1.0) {
			result.riseDate = $moshier.julian.toGregorian ({julian: this.t_rise});
		}
		if (this.t_set != -1.0) {
			result.setDate = $moshier.julian.toGregorian ({julian: this.t_set});
			if (this.t_rise != -1.0) {
				t0 = this.t_set - this.t_rise;
				if ((t0 > 0.0) && (t0 < 1.0)) {
					result.visibleHaours = 24.0 * t0;
				}
			}
		}

		if (
			(Math.abs($moshier.body.earth.position.date.julian - this.t_rise) > 0.5) &&
			(Math.abs($moshier.body.earth.position.date.julian - this.t_trnsit) > 0.5) &&
			(Math.abs($moshier.body.earth.position.date.julian - this.t_set) > 0.5)
		) {
			// wrong event date
			result.wrongEventDate = true;
		}
	}
// no_trnsit:
	//JD = JDsave;
	//TDT = TDTsave;
	//UT = UTsave;
	/* Reset to original input date entry.  */
	// update();
	//prtflg = prtsave;
	this.f_trnsit = 1;
	return result;
};

/* If the initial approximation fails to locate a rise or set time,
 this function steps between the transit time and the previous
 or next inferior transits to find an event more reliably.  */
$ns.transit.noRiseSet = function (t0, callback) {
	var t_trnsit0 = this.t_trnsit; // double
	var el_trnsit0 = this.elevation_trnsit; // double
	var t, e; // double
	var t_above, el_above, t_below, el_below; // double

	/* Step time toward previous inferior transit to find
	 whether a rise event was missed.  The step size is a function
	 of the azimuth and decreases near the transit time.  */
	t_above = t_trnsit0;
	el_above = el_trnsit0;
	t_below = -1.0;
	el_below = el_above;
	t = t_trnsit0 - 0.25;
	e = 1.0;
	while (e > 0.005) {
		this.iterator (t, callback);
		if ($moshier.altaz.elevation > this.elevation_threshold) {
			/* Object still above horizon.  */
			t_above = t;
			el_above = $moshier.altaz.elevation;
		} else {
			/* Object is below horizon.  Rise event is bracketed.
			 Proceed to interval halving search.  */
			t_below = t;
			el_below = $moshier.altaz.elevation;
			break; // goto search_rise;
		}
		/* Step time by an amount proportional to the azimuth deviation.  */
		e = azimuth/360.0;
		if (azimuth < 180.0)
		{
			if (this.southern_hemisphere == 0) {
				t -= this.STEP_SCALE * e;
			} else {
				t += this.STEP_SCALE * e;
			}
		} else {
			e = 1.0 - e;
			if (this.southern_hemisphere == 0) {
				t += this.STEP_SCALE * e;
			} else {
				t -= this.STEP_SCALE * e;
			}
		}
	}

	/* No rise event detected.  */
	if ($moshier.altaz.elevation > this.elevation_threshold) {
		/* printf ("Previous inferior transit is above horizon.\n"); */
		this.t_rise = -1.0;
		// goto next_midnight;
	} else {
	/* Find missed rise time. */
// search_rise:
		this.t_rise = this.searchHalve (t_below, el_below, t_above, el_above, callback);
		this.f_trnsit = 1;
	}

// next_midnight:
	/* Step forward in time toward the next inferior transit.  */
	t_above = t_trnsit0;
	el_above = el_trnsit0;
	t_below = -1.0;
	el_below = el_above;
	t = t_trnsit0 + 0.25;
	e = 1.0;
	while (e > 0.005) {
		this.iterator (t, callback);
		if ($moshier.altaz.elevation > this.elevation_threshold) {
			/* Object still above horizon.  */
			t_above = t;
			el_above = $moshier.altaz.elevation;
		} else {
			/* Object is below horizon.  Event is bracketed.
			 Proceed to interval halving search.  */
			t_below = t;
			el_below = $moshier.altaz.elevation;
			break; // goto search_set;
		}
		/* Step time by an amount proportional to the azimuth deviation.  */
		e = $moshier.altaz.azimuth/360.0;
		if ($moshier.altaz.azimuth < 180.0) {
			if (this.southern_hemisphere == 0) {
				t -= this.STEP_SCALE * e;
			} else {
				t += this.STEP_SCALE * e;  /* Southern hemisphere observer.  */
			}
		} else {
			e = 1.0 - e;
			if (this.southern_hemisphere == 0) {
				t += this.STEP_SCALE * e;
			} else {
				t -= this.STEP_SCALE * e;
			}
		}
	}

	if ($moshier.altaz.elevation > this.elevation_threshold) {
		/* printf ("Next inferior transit is above horizon.\n"); */
		this.t_set = -1.0;
		// return 0;
	} else {
	/* Find missed set time. */
// search_set:
		this.t_set = search_halve (t, elevation, this.t_trnsit, this.elevation_trnsit, callback);
		this.f_trnsit = 1;
	}
};

/* Search rise or set time by simple interval halving
 after the event has been bracketed in time.  */
$ns.transit.searchHalve = function (t1, y1, t2, y2, callback) {
	var e2, e1, em, tm, ym; // double

	e2 = y2 - this.elevation_threshold;
	e1 = y1 - this.elevation_threshold;
	tm = 0.5 * (t1 + t2);

	while( Math.abs(t2 - t1) > .00001 ) {
		/* Evaluate at middle of current interval.  */
		tm = 0.5 * (t1 + t2);
		this.iterator (tm, callback);
		ym = $moshier.altaz.elevation;
		em = ym - this.elevation_threshold;
		/* Replace the interval boundary whose error has the same sign as em.  */
		if( em * e2 > 0 ) {
			y2 = ym;
			t2 = tm;
			e2 = em;
		} else {
			y1 = ym;
			t1 = tm;
			e1 = em;
		}
	}
	return tm;
};