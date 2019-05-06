import { showcor } from './util';
import constant from './constant';
import variable from './variable';

export const calc = function(p, q, e, result) {
  var C; // double
  var i; // int

  C = 1.974e-8 / (variable.SE * (1.0 + variable.qe));
  for (i = 0; i < 3; i++) {
    variable.dp[i] = C * ((variable.pq * e[i]) / variable.SE - (variable.ep * q[i]) / variable.SO);
    p[i] += variable.dp[i];
  }

  result = result || {};

  result.sunElongation = Math.acos(-variable.ep) / constant.DTR;
  result.lightDeflection = showcor(p, variable.dp);

  return result;
};
