import { kepler } from './kepler'

export const vearth = {
	jvearth: -1.0,
	vearth: []
};

vearth.calc = (date, earthBody) => {
	var e = [], p = [], t; // double
	var i; // int

	if( date.julian == vearth.jvearth ) {
		return;
	}

	vearth.jvearth = date.julian;

	/* calculate heliocentric position of the earth
	 * as of a short time ago.
	 */
	t = 0.005;
	const keplerEarthBody = kepler.calc({julian: date.julian - t}, {...earthBody}, e, p);

	for( i=0; i<3; i++ ) {
		vearth.vearth[i] = (keplerEarthBody.position.rect[i] - e[i])/t;
	}
};
