$ns.aberration = {};

$ns.aberration.calc = function (p, result) {
	var A, B, C; // double
	var betai, pV; // double
	var x = [], V = []; // double
	var i; // int

	/* Calculate the velocity of the earth (see vearth.c).
	 */
	$moshier.vearth.calc ($moshier.body.earth.position.date);
	betai = 0.0;
	pV = 0.0;
	for( i=0; i<3; i++ ) {
		A = $moshier.vearth.vearth [i]/$const.Clightaud;
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
		$const.dp[i] = C - p[i];
	}

	result = result || {};

	$util.showcor (p, $const.dp, result);
	for( i=0; i<3; i++ ) {
		p[i] = x[i];
	}

	return result;
};