$ns.precess = {
	/* In WILLIAMS and SIMON, Laskar's terms of order higher than t^4
	 have been retained, because Simon et al mention that the solution
	 is the same except for the lower order terms.  */
	pAcof: [
		/* Corrections to Williams (1994) introduced in DE403.  */
		-8.66e-10, -4.759e-8, 2.424e-7, 1.3095e-5, 1.7451e-4, -1.8055e-3,
		-0.235316, 0.076, 110.5414, 50287.91959
	],
	/* Pi from Williams' 1994 paper, in radians.  No change in DE403.  */
	nodecof: [
		6.6402e-16, -2.69151e-15, -1.547021e-12, 7.521313e-12, 1.9e-10,
		-3.54e-9, -1.8103e-7,  1.26e-7,  7.436169e-5,
		-0.04207794833,  3.052115282424
	],
	/* pi from Williams' 1994 paper, in radians.  No change in DE403.  */
	inclcof: [
		1.2147e-16, 7.3759e-17, -8.26287e-14, 2.503410e-13, 2.4650839e-11,
		-5.4000441e-11, 1.32115526e-9, -6.012e-7, -1.62442e-5,
		0.00227850649, 0.0
	]
};

/* Precession of the equinox and ecliptic
 * from epoch Julian date J to or from J2000.0
 *
 * Subroutine arguments:
 *
 * R = rectangular equatorial coordinate vector to be precessed.
 *     The result is written back into the input vector.
 * J = Julian date
 * direction =
 *      Precess from J to J2000: direction = 1
 *      Precess from J2000 to J: direction = -1
 * Note that if you want to precess from J1 to J2, you would
 * first go from J1 to J2000, then call the program again
 * to go from J2000 to J2.
 */
$ns.precess.calc = function (R, date, direction) {
	var A, B, T, pA, W, z; // double
	var x = []; // double
	var p; // double array
	var p_i = 0;
	var i; // int

	if( date.julian == $const.j2000 ) {
		return;
	}
	/* Each precession angle is specified by a polynomial in
	 * T = Julian centuries from J2000.0.  See AA page B18.
	 */
	T = (date.julian - $const.j2000) / 36525.0;

	/* Implementation by elementary rotations using Laskar's expansions.
	 * First rotate about the x axis from the initial equator
	 * to the ecliptic. (The input is equatorial.)
	 */
	if (direction == 1) {
		$moshier.epsilon.calc (date); /* To J2000 */
	} else {
		$moshier.epsilon.calc ({julian: $const.j2000}); /* From J2000 */
	}
	x[0] = R[0];
	z = $moshier.epsilon.coseps*R[1] + $moshier.epsilon.sineps*R[2];
	x[2] = -$moshier.epsilon.sineps*R[1] + $moshier.epsilon.coseps*R[2];
	x[1] = z;

	/* Precession in longitude
	 */
	T /= 10.0; /* thousands of years */
	p = this.pAcof;
	pA = p [p_i ++]; //*p++;
	for( i=0; i<9; i++ ) {
		pA = pA * T + p [p_i ++]; //*p++;
	}
	pA *= $const.STR * T;

	/* Node of the moving ecliptic on the J2000 ecliptic.
	 */
	p = this.nodecof;
	p_i = 0;
	W = p [p_i ++]; //*p++;
	for( i=0; i<10; i++ ) {
		W = W * T + p [p_i ++]; //*p++;
	}

	/* Rotate about z axis to the node.
	 */
	if( direction == 1 ) {
		z = W + pA;
	} else {
		z = W;
	}
	B = Math.cos(z);
	A = Math.sin(z);
	z = B * x[0] + A * x[1];
	x[1] = -A * x[0] + B * x[1];
	x[0] = z;

	/* Rotate about new x axis by the inclination of the moving
	 * ecliptic on the J2000 ecliptic.
	 */
	p = this.inclcof;
	p_i = 0;
	z = p [p_i ++]; //*p++;
	for( i=0; i<10; i++ ) {
		z = z * T + p [p_i ++]; //*p++;
	}
	if( direction == 1 ) {
		z = -z;
	}
	B = Math.cos(z);
	A = Math.sin(z);
	z = B * x[1] + A * x[2];
	x[2] = -A * x[1] + B * x[2];
	x[1] = z;

	/* Rotate about new z axis back from the node.
	 */
	if( direction == 1 ) {
		z = -W;
	} else {
		z = -W - pA;
	}
	B = Math.cos(z);
	A = Math.sin(z);
	z = B * x[0] + A * x[1];
	x[1] = -A * x[0] + B * x[1];
	x[0] = z;

	/* Rotate about x axis to final equator.
	 */
	if( direction == 1 ) {
		$moshier.epsilon.calc ({julian: $const.j2000});
	} else {
		$moshier.epsilon.calc ( date );
	}
	z = $moshier.epsilon.coseps * x[1] - $moshier.epsilon.sineps * x[2];
	x[2] = $moshier.epsilon.sineps * x[1] + $moshier.epsilon.coseps * x[2];
	x[1] = z;

	for( i=0; i<3; i++ ) {
		R[i] = x[i];
	}
};