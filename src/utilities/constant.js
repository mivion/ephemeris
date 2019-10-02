import { CLIGHT, J2000, B1950, J1900, RTOH, DTR, RTD, RTS, STR, EMRAT, TPI,
FLAT, AU, AEARTH } from '../constants'

export const constant = {
  tlong: 0.00, // input for kinit
	tlat: 0.00, /* geocentric */ // input for kinit
  glat: 0.00, /* geodetic */ // input for kinit

	/* Parameters for calculation of azimuth and elevation
	 */
	attemp: 12.0,	/* atmospheric temperature, degrees Centigrade */ // input for kinit
	atpress: 1010.0, /* atmospheric pressure, millibars */ // input for kinit

	/* Distance from observer to center of earth, in earth radii
	 */
  trho: 0.9985,
	height: 0.0,



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

};
