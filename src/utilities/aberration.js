import { CLIGHTAUD } from '../constants'
import { util } from './util'
import VelocityEarth from './VelocityEarth'

export const aberration = {
  calc: (p, earthBody, observer, body, result) => {
  	var A, B, C; // double
  	var betai, pV; // double
  	var x = [], V = []; // double
  	var i; // int

  	/* Calculate the velocity of the earth (see vearth.c).
  	 */
  	const velocityEarth = new VelocityEarth(observer.Date.julian, earthBody);
  	betai = 0.0;
  	pV = 0.0;
  	for( i=0; i<3; i++ ) {
  		A = velocityEarth.vearth[i] / CLIGHTAUD;
  		V[i] = A;
  		betai += A*A;
  		pV += p[i] * A;
  	}
  	/* Make the adjustment for aberration.
  	 */
  	betai = Math.sqrt( 1.0 - betai );
  	C = 1.0 + pV;
  	A = betai/C;
  	B = (1.0  +  pV/(1.0 + betai))/C;

  	for( i=0; i<3; i++ ) {
  		C = A * p[i]  +  B * V[i];
  		x[i] = C;
  		body.locals.dp[i] = C - p[i];
  	}

  	result = result || {};

    util.showcor (p, body.locals.dp, result);
  	for( i=0; i<3; i++ ) {
  		p[i] = x[i];
  	}

  	return result;
  }
};
