import { STR } from '../constants'

export const epsilon = {};

// TODO - all date params should be replaced with julian date
epsilon.calc = date => {
  /* The results of the program are returned in these
   * global variables:
   */
  let epsilonObject = {
    jdeps: -1.0, /* Date for which obliquity was last computed */
    eps: 0.0, /* The computed obliquity in radians */
    coseps: 0.0, /* Cosine of the obliquity */
    sineps: 0.0 /* Sine of the obliquity */
  }

	var T; // double
	T = (date.julian - 2451545.0)/36525.0;

	/* DE403 values. */
		T /= 10.0;
	epsilonObject.eps = ((((((((( 2.45e-10*T + 5.79e-9)*T + 2.787e-7)*T
		+ 7.12e-7)*T - 3.905e-5)*T - 2.4967e-3)*T
		- 5.138e-3)*T + 1.9989)*T - 0.0175)*T - 468.33960)*T
		+ 84381.406173;
	epsilonObject.eps *= STR;

	epsilonObject.coseps = Math.cos( epsilonObject.eps );
	epsilonObject.sineps = Math.sin( epsilonObject.eps );
	epsilonObject.jdeps = date.julian;

  return epsilonObject
};
