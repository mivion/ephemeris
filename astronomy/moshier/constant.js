$ns.constant = {
	/* Standard epochs.  Note Julian epochs (J) are measured in
	 * years of 365.25 days.
	 */
	j2000: 2451545.0,	/* 2000 January 1.5 */
	b1950: 2433282.423,	/* 1950 January 0.923 Besselian epoch */
	j1900: 2415020.0,	/* 1900 January 0, 12h UT */
	RTOH: 12.0 / Math.PI, /* Radians to hours, minutes, seconds */


	/* Conversion factors between degrees and radians */
	DTR: 1.7453292519943295769e-2,
	RTD: 5.7295779513082320877e1,
	RTS: 2.0626480624709635516e5, /* arc seconds per radian */
	STR: 4.8481368110953599359e-6, /* radians per arc second */

	TPI: 2.0 * Math.PI,

	date: {}, /* Input date */

	tlong: -71.13,	/* Cambridge, Massachusetts */ // input for kinit
	tlat: 42.38, /* geocentric */ // input for kinit
	glat: 42.27, /* geodetic */ // input for kinit

	/* Parameters for calculation of azimuth and elevation
	 */
	attemp: 12.0,	/* atmospheric temperature, degrees Centigrade */ // input for kinit
	atpress: 1010.0, /* atmospheric pressure, millibars */ // input for kinit

	/* If the following number
	 * is nonzero, then the program will return it for delta T
	 * and not calculate anything.
	 */
	dtgiven: 0.0, // input for kinit

	/* Distance from observer to center of earth, in earth radii
	 */
	trho: 0.9985,
	flat: 298.257222,
	height: 0.0,

	/* Radius of the earth in au
	 Thanks to Min He <Min.He@businessobjects.com> for pointing out
	 this needs to be initialized early.  */
	Rearth: 0.0, // calculated in kinit

	/* Constants used elsewhere. These are DE403 values. */
	aearth: 6378137.,  /* Radius of the earth, in meters.  */
	au: 1.49597870691e8, /* Astronomical unit, in kilometers.  */
	emrat: 81.300585,  /* Earth/Moon mass ratio.  */
	Clight: 2.99792458e5,  /* Speed of light, km/sec  */
	Clightaud: 0.0, /* C in au/day  */

	/* approximate motion of right ascension and declination
	 * of object, in radians per day
	 */
	dradt: 0.0,
	ddecdt: 0.0,

	SE: 0.0,	/* earth-sun distance */
	SO: 0.0,	/* object-sun distance */
	EO: 0.0,	/* object-earth distance */

	pq: 0.0,	/* cosine of sun-object-earth angle */
	ep: 0.0,	/* -cosine of sun-earth-object angle */
	qe: 0.0,	/* cosine of earth-sun-object angle */

	/* correction vector, saved for display  */
	dp: [],

	/*
	 * Current kepler body
	 */
	body: {}
};