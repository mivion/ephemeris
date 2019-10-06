import { kepler } from './kepler'
import { util } from './util'
import VelocityEarth from './VelocityEarth'

export const light = {};

light.calc = function (body, q, e, earthBody, observer) {
  const p0 = light.getP0(q, e)
	var p = [], ptemp = []; // double
	var P, Q, E, t, x, y; // double

	E = 0.0;
	for(let i=0; i<3; i++ ) {
		E += e[i]*e[i];
	}
	E = Math.sqrt(E);

	for(let k=0; k<2; k++ ) {
		P = 0.0;
		Q = 0.0;
		for(let i=0; i<3; i++ ) {
			y = q[i];
			x = y - e[i];
			p[i] = x;
			Q += y * y;
			P += x * x;
		}
		P = Math.sqrt(P);
		Q = Math.sqrt(Q);
		/* Note the following blows up if object equals sun. */
		t = (P + 1.97e-8 * Math.log( (E+P+Q)/(E-P+Q) ) )/173.1446327;
		body = kepler.calc(observer.Date.julian - t, body, q, ptemp );
	}

	body.lightTime = 1440.0 * t;

	/* Final object-earth vector and the amount by which it changed.
	 */
	for(let i=0; i<3; i++ ) {
		x = q[i] - e[i];
		p[i] = x;
		body.locals.dp [i] = x - p0[i];
	}

	body.aberration = util.showcor(p0, body.locals.dp );

	/* Calculate dRA/dt and dDec/dt.
	 * The desired correction of apparent coordinates is relative
	 * to the equinox of date, but the coordinates here are
	 * for J2000.  This introduces a slight error.
	 *
	 * Estimate object-earth vector t days ago.  We have
	 * p(?) = q(J-t) - e(J), and must adjust to
	 * p(J-t)  =  q(J-t) - e(J-t)  =  q(J-t) - (e(J) - Vearth * t)
	 *         =  p(?) + Vearth * t.
	 */
  const velocityEarth = new VelocityEarth(observer.Date.julian, earthBody);

	for(let i=0; i<3; i++ ) {
		p[i] += velocityEarth.vearth[i]*t;
	}

	var d = util.deltap( p, p0);  /* see dms.c */
	body.locals.dradt = d.dr;
	body.locals.ddecdt = d.dd;
	body.locals.dradt /= t;
	body.locals.ddecdt /= t;
};

light.getP0 = (q, e) => {
  let p0 = []
  /* save initial q-e vector for display */
  for(let i=0; i<3; i++ ) {
		p0[i] = q[i] - e[i];
	}

  return p0
}
