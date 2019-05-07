import { sinh, cosh, tanh, modtp, mod360, zatan2 } from './util';
import { calc as gplanCalc, calc3 as gplanCalc3, moon as gplanMoon } from './gplan';
import { calc as precessCalc } from './precess';
import epsilon, { calc as epsilonCalc } from './epsilon';
import constant from './constant';
import input from './input';
import variable from './variable';

/* Adjust position from Earth-Moon barycenter to Earth
 *
 * J = Julian day number
 * emb = Equatorial rectangular coordinates of EMB.
 * return = Earth's distance to the Sun (au)
 */
export const embofs = function(date, ea) {
  const pm = [];
  const polm = [];

  /* Compute the vector Moon - Earth.  */
  gplanMoon(date, pm, polm);

  /* Precess the lunar position
   * to ecliptic and equinox of J2000.0
   */
  precessCalc(pm, date, 1);

  /* Adjust the coordinates of the Earth
   */
  const a = 1.0 / (constant.emrat + 1.0);
  let b = 0.0;
  for (let i = 0; i < 3; i++) {
    ea[i] = ea[i] - a * pm[i];
    b = b + ea[i] * ea[i];
  }
  /* Sun-Earth distance.  */
  return Math.sqrt(b);
};

export const calc = function(date, body, rect, polar) {
  rect = rect || [];
  polar = polar || [];

  let E, W, r;

  /* Call program to compute position, if one is supplied.  */
  if (body.ptable) {
    if (body.key == 'earth') {
      gplanCalc3(date, body.ptable, polar, 3);
    } else {
      gplanCalc(date, body.ptable, polar);
    }
    E = polar[0]; /* longitude */
    body.longitude = E;
    W = polar[1]; /* latitude */
    r = polar[2]; /* radius */
    body.distance = r;
    body.epoch = date.julian;
    body.equinox = { julian: constant.j2000 };
    // goto kepdon;
  } else {
    let alat;

    /* Decant the parameters from the data structure */
    const epoch = body.epoch;
    let inclination = body.inclination;
    const ascnode = body.node * constant.DTR;
    const argperih = body.perihelion;
    let meandistance = body.semiAxis; /* semimajor axis */
    let dailymotion = body.dailyMotion;
    const eccent = body.eccentricity;
    let meananomaly = body.anomaly;
    /* Check for parabolic orbit. */
    if (eccent == 1.0) {
      /* meandistance = perihelion distance, q
       * epoch = perihelion passage date
       */
      let temp = meandistance * Math.sqrt(meandistance);
      W = ((date.julian - epoch) * 0.0364911624) / temp;
      /* The constant above is 3 k / sqrt(2),
       * k = Gaussian gravitational constant = 0.01720209895 . */
      let E = 0.0;
      let M = 1.0;
      while (Math.abs(M) > 1.0e-11) {
        temp = E * E;
        temp = (2.0 * E * temp + W) / (3.0 * (1.0 + temp));
        M = temp - E;
        if (temp != 0.0) {
          M /= temp;
        }
        E = temp;
      }
      r = meandistance * (1.0 + E * E);
      M = Math.atan(E);
      M = 2.0 * M;
      alat = M + constant.DTR * argperih;
      // goto parabcon;
    } else {
      if (eccent > 1.0) {
        /* The equation of the hyperbola in polar coordinates r, theta
         * is r = a(e^2 - 1)/(1 + e cos(theta))
         * so the perihelion distance q = a(e-1),
         * the "mean distance"  a = q/(e-1).
         */
        meandistance = meandistance / (eccent - 1.0);
        W = ((date.julian - epoch) * 0.01720209895) / (meandistance * Math.sqrt(meandistance));
        /* solve M = -E + e sinh E */
        E = W / (eccent - 1.0);
        let M = 1.0;
        while (Math.abs(M) > 1.0e-11) {
          M = -E + eccent * sinh(E) - W;
          E += M / (1.0 - eccent * cosh(E));
        }
        r = meandistance * (-1.0 + eccent * cosh(E));
        M = Math.sqrt((eccent + 1.0) / (eccent - 1.0)) * tanh(0.5 * E);
        M = 2.0 * Math.atan(M);
        alat = M + constant.DTR * argperih;
        // goto parabcon;
      } else {
        /* Calculate the daily motion, if it is not given.
         */
        if (dailymotion == 0.0) {
          /* The constant is 180 k / pi, k = Gaussian gravitational constant.
           * Assumes object in heliocentric orbit is massless.
           */
          dailymotion = 0.9856076686 / (body.semiAxis * Math.sqrt(body.semiAxis));
        }
        dailymotion *= date.julian - epoch;
        /* M is proportional to the area swept out by the radius
         * vector of a circular orbit during the time between
         * perihelion passage and Julian date J.
         * It is the mean anomaly at time J.
         */
        let M = constant.DTR * (meananomaly + dailymotion);
        M = modtp(M);
        /* If mean longitude was calculated, adjust it also
         * for motion since epoch of elements.
         */
        if (body.longitude) {
          body.longitude += dailymotion;
          body.longitude = mod360(body.longitude);
        }

        /* By Kepler's second law, M must be equal to
         * the area swept out in the same time by an
         * elliptical orbit of same total area.
         * Integrate the ellipse expressed in polar coordinates
         *     r = a(1-e^2)/(1 + e cosW)
         * with respect to the angle W to get an expression for the
         * area swept out by the radius vector.  The area is given
         * by the mean anomaly; the angle is solved numerically.
         *
         * The answer is obtained in two steps.  We first solve
         * Kepler's equation
         *    M = E - eccent*sin(E)
         * for the eccentric anomaly E.  Then there is a
         * closed form solution for W in terms of E.
         */

        E = M; /* Initial guess is same as circular orbit. */
        let temp = 1.0;
        do {
          /* The approximate area swept out in the ellipse */
          temp =
            E -
            eccent * Math.sin(E) -
            /* ...minus the area swept out in the circle */
            M;
          /* ...should be zero.  Use the derivative of the error
           * to converge to solution by Newton's method.
           */
          E -= temp / (1.0 - eccent * Math.cos(E));
        } while (Math.abs(temp) > 1.0e-11);

        /* The exact formula for the area in the ellipse is
         *    2.0*atan(c2*tan(0.5*W)) - c1*eccent*sin(W)/(1+e*cos(W))
         * where
         *    c1 = sqrt( 1.0 - eccent*eccent )
         *    c2 = sqrt( (1.0-eccent)/(1.0+eccent) ).
         * Substituting the following value of W
         * yields the exact solution.
         */
        temp = Math.sqrt((1.0 + eccent) / (1.0 - eccent));
        W = 2.0 * Math.atan(temp * Math.tan(0.5 * E));

        /* The true anomaly. */
        W = modtp(W);

        meananomaly *= constant.DTR;
        /* Orbital longitude measured from node
         * (argument of latitude)
         */
        if (body.longitude) {
          alat = body.longitude * constant.DTR + W - meananomaly - ascnode;
        } else {
          alat = W + constant.DTR * argperih; /* mean longitude not given */
        }

        /* From the equation of the ellipse, get the
         * radius from central focus to the object.
         */
        r = (meandistance * (1.0 - eccent * eccent)) / (1.0 + eccent * Math.cos(W));
      }
    }
    // parabcon:
    /* The heliocentric ecliptic longitude of the object
     * is given by
     *   tan( longitude - ascnode )  =  cos( inclination ) * tan( alat ).
     */
    const coso = Math.cos(alat);
    const sino = Math.sin(alat);
    inclination *= constant.DTR;
    W = sino * Math.cos(inclination);
    E = zatan2(coso, W) + ascnode;

    /* The ecliptic latitude of the object */
    W = sino * Math.sin(inclination);
    W = Math.asin(W);
  }
  // kepdon:

  /* Convert to rectangular coordinates,
   * using the perturbed latitude.
   */
  rect[2] = r * Math.sin(W);
  const cosa = Math.cos(W);
  rect[1] = r * cosa * Math.sin(E);
  rect[0] = r * cosa * Math.cos(E);

  /* Convert from heliocentric ecliptic rectangular
   * to heliocentric equatorial rectangular coordinates
   * by rotating eps radians about the x axis.
   */
  epsilonCalc(body.equinox);
  W = epsilon.coseps * rect[1] - epsilon.sineps * rect[2];
  const M = epsilon.sineps * rect[1] + epsilon.coseps * rect[2];
  rect[1] = W;
  rect[2] = M;

  /* Precess the position to ecliptic and equinox of J2000.0 if not already there. */
  precessCalc(rect, body.equinox, 1);

  /* If earth, adjust from earth-moon barycenter to earth by AA page E2. */
  if (body.key == 'earth') {
    r = embofs(date, rect); /* see below */
  }

  /* Rotate back into the ecliptic.  */
  epsilonCalc({ julian: constant.j2000 });
  W = epsilon.coseps * rect[1] + epsilon.sineps * rect[2];
  const M2 = -epsilon.sineps * rect[1] + epsilon.coseps * rect[2];

  /* Convert to polar coordinates */
  E = zatan2(rect[0], W);
  W = Math.asin(M2 / r);

  /* Output the polar cooordinates */
  polar[0] = E; /* longitude */
  polar[1] = W; /* latitude */
  polar[2] = r; /* radius */

  // fill the body.position only if rect and polar are not defined
  if (arguments.length < 4) {
    body.position = {
      date: date,
      rect: rect,
      polar: polar
    };
  }
};

export const init = function() {
  const u1 = input.glat * constant.DTR;

  /* Reduction from geodetic latitude to geocentric latitude
   * AA page K5
   */
  const co = Math.cos(u1);
  let si = Math.sin(u1);
  let fl = 1.0 - 1.0 / constant.flat;
  fl = fl * fl;
  si = si * si;
  const u2 = 1.0 / Math.sqrt(co * co + fl * si);
  const a = constant.aearth * u2 + input.height;
  const b = constant.aearth * fl * u2 + input.height;
  variable.trho = Math.sqrt(a * a * co * co + b * b * si);
  variable.tlat = constant.RTD * Math.acos((a * co) / variable.trho);
  if (input.glat < 0.0) {
    variable.tlat = -variable.tlat;
  }
  variable.trho /= constant.aearth;

  /* Reduction from geodetic latitude to geocentric latitude
   * AA page K5
   */
  /*
   tlat = glat
   - 0.19242861 * sin(2.0*u)
   + 0.00032314 * sin(4.0*u)
   - 0.00000072 * sin(6.0*u);

   trho =    0.998327073
   + 0.001676438 * cos(2.0*u)
   - 0.000003519 * cos(4.0*u)
   + 0.000000008 * cos(6.0*u);
   trho += height/6378160.;
   */
};
