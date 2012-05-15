/**
 *
 * body definition {
 *
 *	// body
 *	epoch:			epoch = epoch of orbital elements
 *	inclination:	i = inclination
 *	node:			W = longitude of the ascending node
 *	perihelion:		w = argument of the perihelion
 *	semiAxis:		a = mean distance (semimajor axis), if 0.0 then = perihelionDistance / (1 - eccentricity)
 *	dailyMotion:	dm = daily motion, if 0.0 will be calculated
 *	eccentricity:	ecc = eccentricity
 *	anomaly:		M = mean anomaly
 *	equinox:		equinox = epoch of equinox and ecliptic
 *	magnitude: 		mag = visual magnitude at 1AU from earth and sun
 *	semiDiameter:	sdiam = equatorial semidiameter at 1au, arc seconds
 *	perihelionDistance: = perihelion distance
 *  // computed values
 *	longitude:		L = computed mean longitude
 *	distance:		r = computed radius vector
 *	perturbation	plat = perturbation in ecliptic latitude
 *
 *	// star
 *	ra:				ra = right ascension, radians
 *	dec:			dec = declination, radians
 *	parallax:		px = parallax, radians
 *	raMotion:		mura = proper motion in R.A., rad/century
 *	decMotion:		mudec = proper motion in Dec., rad/century
 *	velocity:		v = radial velocity, km/s
 *	equinox:		equinox = epoch of equinox and ecliptic
 *	magnitude:		mag = visual magnitude
 *
 *  // constellation
 *  index:			index of constellation (1-88)
 *  raLow:			lower right ascension, in units of hours times 3600
 *  raHight:		upper right ascension, in units of hours times 3600
 *  dec0:			lower declination, in units of degrees times 3600
 *
 * }
 *
 */

$ns.body = {
	/**
	 * Sun
	 */
	sun: {
		weight: 100
	},

	/**
	 * Planets
	 */
	mercury: {
		epoch: 2446800.5, // 05.01.1987
		inclination: 7.0048,
		node: 48.177,
		perihelion: 29.074,
		semiAxis: 0.387098,
		dailyMotion: 4.09236,
		eccentricity: 0.205628,
		anomaly: 198.7199,
		equinox: {julian: 2446800.5},
		magnitude: -0.42,
		semiDiameter: 3.36
	},
	venus: {
		epoch: 2446800.5, // 05.01.1987
		inclination: 3.3946,
		node: 76.561,
		perihelion: 54.889,
		semiAxis: 0.723329,
		dailyMotion: 1.60214,
		eccentricity: 0.006757,
		anomaly: 9.0369,
		equinox: {julian: 2446800.5},
		/* Note the calculated apparent visual magnitude for Venus
		 * is not very accurate.
		 */
		magnitude: -4.40,
		semiDiameter: 8.34
	},
	earth: {
		epoch: 2446800.5, // 05.01.1987
		inclination: 0.0,
		node: 0.0,
		perihelion: 102.884,
		semiAxis: 0.999999,
		dailyMotion: 0.985611,
		eccentricity: 0.016713,
		anomaly: 1.1791,
		equinox: {julian: 2446800.5},
		magnitude: -3.86,
		semiDiameter: 0.0,
		longitude: 0.0, // computed
		distance: 0.0, // computed
		perturbation: 0.0 // computed
	},
	moon: {
	},
	mars: {
		epoch: 2446800.5, // 05.01.1987
		inclination: 1.8498,
		node: 49.457,
		perihelion: 286.343,
		semiAxis: 1.523710,
		dailyMotion: 0.524023,
		eccentricity: 0.093472,
		anomaly: 53.1893,
		equinox: {julian: 2446800.5},
		magnitude: -1.52,
		semiDiameter: 4.68
	},
	jupiter: {
		epoch: 2446800.5, // 05.01.1987
		inclination: 1.3051,
		node: 100.358,
		perihelion: 275.129,
		semiAxis: 5.20265,
		dailyMotion: 0.0830948,
		eccentricity: 0.048100,
		anomaly: 344.5086,
		equinox: {julian: 2446800.5},
		magnitude: -9.40,
		semiDiameter: 98.44
	},
	saturn: {
		epoch: 2446800.5, // 05.01.1987
		inclination: 2.4858,
		node: 113.555,
		perihelion: 337.969,
		semiAxis: 9.54050,
		dailyMotion: 0.0334510,
		eccentricity: 0.052786,
		anomaly: 159.6327,
		equinox: {julian: 2446800.5},
		magnitude: -8.88,
		semiDiameter: 82.73
	},
	uranus: {
		epoch: 2446800.5, // 05.01.1987
		inclination: 0.7738,
		node: 73.994,
		perihelion: 98.746,
		semiAxis: 19.2233,
		dailyMotion: 0.0116943,
		eccentricity: 0.045682,
		anomaly: 84.8516,
		equinox: {julian: 2446800.5},
		magnitude: -7.19,
		semiDiameter: 35.02
	},
	neptune: {
		epoch: 2446800.5, // 05.01.1987
		inclination: 1.7697,
		node: 131.677,
		perihelion: 250.623,
		semiAxis: 30.1631,
		dailyMotion: 0.00594978,
		eccentricity: 0.009019,
		anomaly: 254.2568,
		equinox: {julian: 2446800.5},
		magnitude: -6.87,
		semiDiameter: 33.50
	},
	pluto: {
		epoch: 2446640.5,
		inclination: 17.1346,
		node: 110.204,
		perihelion: 114.21,
		semiAxis: 39.4633,
		dailyMotion: 0.00397570,
		eccentricity: 0.248662,
		anomaly: 355.0554,
		equinox: {julian: 2446640.5},
		magnitude: -1.0,
		semiDiameter: 2.07
	},

	/**
	 * Comets and asteroids
	 */
	chiron: {
		epoch: 2456000.5,
		inclination: 6.926651533484328,
		node: 209.3851130617651,
		perihelion: 339.4595737215378,
		semiAxis: 0.0, // will be calulated if 0.0
		dailyMotion: 0.0, // will be calculated
		eccentricity: 0.3792037887546262,
		anomaly: 114.8798253094007,
		equinox: {julian: 2450109.234581196786},
		magnitude: 6.5,
		semiDiameter: 0.0,
		perihelionDistance: 8.486494269138399
	},

	/**
	 * Stars (implemented, not tested)
	 */
	sirius: {
		epoch: 2000,
		hmsRa: {hours: 6, minutes: 45, seconds: 8.871},
		hmsDec: {hours: -16, minutes: 42, seconds: 57.99},
		raMotion: -3.847,
		decMotion: -120.53,
		velocity: -7.6,
		parallax: 0.3751,
		magnitude: -1.46,
		ra: 0.0,
		dec: 0.0,
		equinox: {julian: 0.0}
	}
};

$ns.body.init = function () {
	for (var key in this) {
		if (this.hasOwnProperty (key) && key != 'init') {
			// fill the 'key'
			this [key].key = key;
			// fill the ptable for the body
			if ($moshier.plan404.hasOwnProperty (key)) {
				this [key].ptable = $moshier.plan404 [key];
			}
		}
	}
};