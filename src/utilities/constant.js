import { CLIGHT, J2000, B1950, J1900, RTOH, DTR, RTD, RTS, STR, EMRAT, TPI,
FLAT, AU, AEARTH } from '../constants'

export const constant = {
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
