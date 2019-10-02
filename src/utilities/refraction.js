import { DTR } from '../constants'

export const refraction = {};

/* Atmospheric refraction
 * Returns correction in degrees to be added to true altitude
 * to obtain apparent altitude.
 */
refraction.calc = (alt, observer) => {
	var y, y0, D0, N, D, P, Q; // double
	var i; // int

	if( (alt < -2.0) || (alt >= 90.0) ) {
		return 0.0;
	}

	/* For high altitude angle, AA page B61
	 * Accuracy "usually about 0.1' ".
	 */
	if( alt > 15.0 )
	{
		D = 0.00452*observer.atpress/((273.0+observer.attemp)*Math.tan( DTR * alt ));
		return D;
	}

	/* Formula for low altitude is from the Almanac for Computers.
	 * It gives the correction for observed altitude, so has
	 * to be inverted numerically to get the observed from the true.
	 * Accuracy about 0.2' for -20C < T < +40C and 970mb < P < 1050mb.
	 */

	/* Start iteration assuming correction = 0
	 */
	y = alt;
	D = 0.0;
	/* Invert Almanac for Computers formula numerically
	 */
	P = (observer.atpress - 80.0)/930.0;
	Q = 4.8e-3 * (observer.attemp - 10.0);
	y0 = y;
	D0 = D;

	for( i=0; i<4; i++ ) {
		N = y + (7.31/(y+4.4));
		N = 1.0/Math.tan (DTR * N);
		D = N*P/(60.0 + Q * (N + 39.0));
		N = y - y0;
		y0 = D - D0 - N; /* denominator of derivative */

		if( (N != 0.0) && (y0 != 0.0) ) {
		/* Newton iteration with numerically estimated derivative */
			N = y - N*(alt + D - y)/y0;
		} else {
		/* Can't do it on first pass */
			N = alt + D;
		}

		y0 = y;
		D0 = D;
		y = N;
	}
	return D;
};
