import { CLIGHT, J2000, B1950, J1900, RTOH, DTR, RTD, RTS, STR, EMRAT, TPI,
FLAT, AU, AEARTH } from '../constants'

export const constant = {
	date: {}, /* Input date */

	// tlong: -71.13,	/* Cambridge, Massachusetts */ // input for kinit
	// tlat: 42.38, /* geocentric */ // input for kinit
	// glat: 42.27, /* geodetic */ // input for kinit

  tlong: 0.00, // input for kinit
	tlat: 0.00, /* geocentric */ // input for kinit
  glat: 0.00, /* geodetic */ // input for kinit

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
	flat: FLAT,
  trho: 0.9985,
	height: 0.0,

	/* Radius of the earth in au
	 Thanks to Min He <Min.He@businessobjects.com> for pointing out
	 this needs to be initialized early.  */
	Rearth: 0.0, // calculated in kinit

	/* Constants used elsewhere. These are DE403 values. */
	aearth: AEARTH,  /* Radius of the earth, in meters.  */
	au: AU, /* Astronomical unit, in kilometers.  */
	emrat: EMRAT,
	Clight: CLIGHT,  /* Speed of light, km/sec  */
	Clightaud: 0.0, /* C in au/day  */

	/* approximate motion of right ascension and declination
	 * of object, in radians per day
	 */
	dradt: 0.0, // TODO used separately in multiple body calculations - sun, moon, star - migrate to a local variable
	ddecdt: 0.0, // TODO used separately in multiple body calculations - sun, moon, star - migrate to a local variable

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
