import { DTR } from '../constants'
import { util } from './util'

export const deflection = {};

deflection.calc = function (p, q, e, body, result) {
	var C; // double
	var i; // int

	C = 1.974e-8/(body.locals.SE*(1.0+body.locals.qe));
	for( i=0; i<3; i++ ) {
		body.locals.dp[i] = C*(body.locals.pq*e[i]/body.locals.SE - body.locals.ep*q[i]/body.locals.SO);
		p[i] += body.locals.dp[i];
	}

	result = result || {};

	result.sunElongation = Math.acos ( -body.locals.ep ) / DTR;
	result.lightDeflection = util.showcor( p, body.locals.dp );

	return result;
};
