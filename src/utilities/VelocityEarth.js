import { kepler } from './kepler'

export default class VelocityEarth {
  constructor(julianDate, earthBody) {
    this.jvearth = julianDate,
    this.vearth = this.calcVelocityEarth(julianDate, earthBody)

    this.calcVelocityEarth = this.calcVelocityEarth.bind(this)
  }

  calcVelocityEarth(julianDate, earthBody) {
  	var e = [], p = [], t; // double
  	var i; // int

  	/* calculate heliocentric position of the earth
  	 * as of a short time ago.
  	 */
  	t = 0.005;

    const coords = []
  	const keplerEarthBody = kepler.calc(julianDate - t, {...earthBody}, e, p);
  	for( i=0; i<3; i++ ) {
  		coords[i] = (keplerEarthBody.position.rect[i] - e[i])/t;
  	}
    return coords
  }
};
