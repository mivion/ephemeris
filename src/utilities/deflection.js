import { DTR } from '../constants'
import { util } from './util'

export const deflection = {};

deflection.calc = function (p, q, e, constant, result) {
	var C; // double
	var i; // int

	C = 1.974e-8/(constant.SE*(1.0+constant.qe));
	for( i=0; i<3; i++ ) {
		constant.dp[i] = C*(constant.pq*e[i]/constant.SE - constant.ep*q[i]/constant.SO);
		p[i] += constant.dp[i];
	}

	result = result || {};

	result.sunElongation = Math.acos ( -constant.ep ) / DTR;
	result.lightDeflection = util.showcor( p, constant.dp );

	return result;
};
