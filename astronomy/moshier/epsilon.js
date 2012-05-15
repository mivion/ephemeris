$ns.epsilon = {
	/* The results of the program are returned in these
	 * global variables:
	 */
	jdeps: -1.0, /* Date for which obliquity was last computed */
	eps: 0.0, /* The computed obliquity in radians */
	coseps: 0.0, /* Cosine of the obliquity */
	sineps: 0.0 /* Sine of the obliquity */
};

$ns.epsilon.calc = function (date) {
	var T; // double

	if (date.julian == this.jdeps) {
		return;
	}
	T = (date.julian - 2451545.0)/36525.0;

	/* DE403 values. */
		T /= 10.0;
	this.eps = ((((((((( 2.45e-10*T + 5.79e-9)*T + 2.787e-7)*T
		+ 7.12e-7)*T - 3.905e-5)*T - 2.4967e-3)*T
		- 5.138e-3)*T + 1.9989)*T - 0.0175)*T - 468.33960)*T
		+ 84381.406173;
	this.eps *= $const.STR;

	this.coseps = Math.cos( this.eps );
	this.sineps = Math.sin( this.eps );
	this.jdeps = date.julian;
};