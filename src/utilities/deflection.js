import { DTR } from '../constants'
import { util } from './util'

export const deflection = {};

deflection.calc = function (p, q, e, body, result) {
	var C; // double
	var i; // int

	C = 1.974e-8/(body.SE*(1.0+body.qe));
	for( i=0; i<3; i++ ) {
		body.dp[i] = C*(body.pq*e[i]/body.SE - body.ep*q[i]/body.SO);
		p[i] += body.dp[i];
	}

	result = result || {};

	result.sunElongation = Math.acos ( -body.ep ) / DTR;
	result.lightDeflection = util.showcor( p, body.dp );

	return result;
};
