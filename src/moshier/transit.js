import { hms } from './util';
import { calc as julianCalc, toGregorian } from './julian';
import { calc as deltaCalc } from './delta';
import { calc as keplerCalc } from './kepler';
import altaz from './altaz';
import constant from './constant';
import input from './input';
import bodies from './body';
import variable from './variable';

const transit = {
  /* Earth radii per au */
  DISFAC: 2.345478e4,

  /* cosine of 90 degrees 50 minutes: */
  COSSUN: -0.014543897651582657,
  /* cosine of 90 degrees 34 minutes: */
  COSZEN: -9.8900378587411476e-3,

  /* Returned transit, rise, and set times in radians (2 pi = 1 day) */
  r_trnsit: 0.0,
  r_rise: 0.0,
  r_set: 0.0,
  elevation_threshold: 0.0,
  semidiameter: 0.0,
  f_trnsit: 0, // int
  southern_hemisphere: 0, // int

  /* Julian dates of rise, transet and set times.  */
  t_rise: 0.0,
  t_trnsit: 0.0,
  elevation_trnsit: 0.0,
  t_set: 0.0,

  STEP_SCALE: 0.5
};

/* Calculate time of transit
 * assuming RA and Dec change uniformly with time
 */
export const calc = function(date, lha, dec, result) {
  var x, y, z, N, D; // double
  var lhay, cosdec, sindec, coslat, sinlat; // double

  result = result || {};

  transit.f_trnsit = 0;
  /* Initialize to no-event flag value. */
  transit.r_rise = -10.0;
  transit.r_set = -10.0;
  /* observer's geodetic latitude, in radians */
  x = input.glat * constant.DTR;
  coslat = Math.cos(x);
  sinlat = Math.sin(x);

  cosdec = Math.cos(dec);
  sindec = Math.sin(dec);

  if (sinlat < 0) {
    transit.southern_hemisphere = 1;
  } else {
    transit.southern_hemisphere = 0;
  }

  /* Refer to same start of date as iter_trnsit,
   so r_trnsit means the same thing in both programs.  */
  x = Math.floor(date.universal - 0.5) + 0.5; // UT
  x = (date.universal - x) * constant.TPI; // UT
  /* adjust local hour angle */
  y = lha;
  /* printf ("%.7f,", lha); */
  while (y < -Math.PI) {
    y += constant.TPI;
  }
  while (y > Math.PI) {
    y -= constant.TPI;
  }
  lhay = y;
  y = y / (-variable.dradt / constant.TPI + 1.00273790934);
  transit.r_trnsit = x - y;
  /* printf ("rt %.7f ", r_trnsit); */
  /* Ordinarily never print here.  */
  result.approxLocalMeridian = hms(transit.r_trnsit);
  result.UTdate = transit.r_trnsit / constant.TPI;

  if (!(coslat == 0.0 || cosdec == 0.0)) {
    /* The time at which the upper limb of the body meets the
     * horizon depends on the body's angular diameter.
     */
    switch (variable.body.key) {
      /* Sun */
      case 'sun':
        N = transit.COSSUN;
        transit.semidiameter = 0.2666666666666667;
        transit.elevation_threshold = -0.8333333333333333;
        break;

      /* Moon, elevation = -34' - semidiameter + parallax
       * semidiameter = 0.272453 * parallax + 0.0799"
       */
      case 'moon':
        N = 1.0 / (transit.DISFAC * variable.body.position.polar[2]);
        D = Math.asin(N); /* the parallax */
        transit.semidiameter = 0.2725076 * D + 3.874e-7;
        N = -9.890199094634534e-3 - transit.semidiameter + D;
        transit.semidiameter *= constant.RTD;
        transit.elevation_threshold = -34.0 / 60.0 - transit.semidiameter;
        N = Math.sin(N);
        break;

      /* Other object */
      default:
        N = transit.COSZEN;
        transit.semidiameter = 0.0;
        transit.elevation_threshold = -0.5666666666666666;
        break;
    }
    y = (N - sinlat * sindec) / (coslat * cosdec);

    if (y < 1.0 && y > -1.0) {
      transit.f_trnsit = 1;
      /* Derivative of y with respect to declination
       * times rate of change of declination:
       */
      z = -variable.ddecdt * (sinlat + transit.COSZEN * sindec);
      z /= constant.TPI * coslat * cosdec * cosdec;
      /* Derivative of acos(y): */
      z /= Math.sqrt(1.0 - y * y);
      y = Math.acos(y);
      D = -variable.dradt / constant.TPI + 1.00273790934;
      transit.r_rise = x - ((lhay + y) * (1.0 + z)) / D;
      transit.r_set = x - ((lhay - y) * (1.0 - z)) / D;
      /* Ordinarily never print here.  */

      result.dApproxRiseUT = transit.r_rise;
      result.dApproxSetUT = transit.r_set;
      result.approxRiseUT = hms(transit.r_rise);
      result.approxSetUT = hms(transit.r_set);
    }
  }
  return result;
};

/* Compute estimate of lunar rise and set times for iterative solution.  */
export const iterator = function(julian, callback) {
  var date = {
    julian: julian
  };

  toGregorian(date);
  julianCalc(date);
  deltaCalc(date);

  keplerCalc(date, bodies.earth);

  callback();
};

/* Iterative computation of rise, transit, and set times.  */
export const iterateTransit = function(callback, result) {
  //var JDsave, TDTsave, UTsave; // double
  var date, date_trnsit, t0, t1; // double
  var rise1, set1, trnsit1, loopctr; // double
  var isPrtrnsit = false;

  result = result || {};

  loopctr = 0;
  //JDsave = JD;
  //TDTsave = TDT;
  //UTsave = UT;
  //retry = 0;
  /* Start iteration at time given by the user.  */
  t1 = bodies.earth.position.date.universal; // UT

  /* Find transit time. */
  do {
    t0 = t1;
    date = Math.floor(t0 - 0.5) + 0.5;
    iterator(t0, callback);
    t1 = date + transit.r_trnsit / constant.TPI;
    if (++loopctr > 10) {
      break;
      // goto no_trnsit;
    }
  } while (Math.abs(t1 - t0) > 0.0001);

  if (!(loopctr > 10)) {
    transit.t_trnsit = t1;
    transit.elevation_trnsit = altaz.elevation;
    trnsit1 = transit.r_trnsit;
    set1 = transit.r_set;
    if (transit.f_trnsit == 0) {
      /* Rise or set time not found.  Apply a search technique to
       check near inferior transit if object is above horizon now.  */
      transit.t_rise = -1.0;
      transit.t_set = -1.0;
      if (altaz.elevation > transit.elevation_threshold) {
        noRiseSet(transit.t_trnsit, callback);
      }
      // goto prtrnsit;
    } else {
      /* Set current date to be that of the transit just found.  */
      date_trnsit = date;
      t1 = date + transit.r_rise / constant.TPI;
      /* Choose rising no later than transit.  */
      if (t1 >= transit.t_trnsit) {
        date -= 1.0;
        t1 = date + transit.r_rise / constant.TPI;
      }
      loopctr = 0;
      do {
        t0 = t1;
        iterator(t0, callback);
        /* Skip out if no event found.  */
        if (transit.f_trnsit == 0) {
          /* Rise or set time not found.  Apply search technique.  */
          transit.t_rise = -1.0;
          transit.t_set = -1.0;
          noRiseSet(transit.t_trnsit, callback);
          isPrtrnsit = true;
          // goto prtrnsit;
        } else {
          if (++loopctr > 10) {
            // Rise time did not converge
            transit.f_trnsit = 0;
            isPrtrnsit = true;
            // goto prtrnsit;
          } else {
            t1 = date + transit.r_rise / constant.TPI;
            if (t1 > transit.t_trnsit) {
              date -= 1;
              t1 = date + transit.r_rise / constant.TPI;
            }
          }
        }
      } while (Math.abs(t1 - t0) > 0.0001);

      if (!isPrtrnsit) {
        isPrtrnsit = false;
        rise1 = transit.r_rise;
        transit.t_rise = t1;

        /* Set current date to be that of the transit.  */
        date = date_trnsit;
        transit.r_set = set1;
        /* Choose setting no earlier than transit.  */
        t1 = date + transit.r_set / constant.TPI;
        if (t1 <= transit.t_trnsit) {
          date += 1.0;
          t1 = date + transit.r_set / constant.TPI;
        }
        loopctr = 0;
        do {
          t0 = t1;
          iterator(t0, callback);
          if (transit.f_trnsit == 0) {
            /* Rise or set time not found.  Apply search technique.  */
            transit.t_rise = -1.0;
            transit.t_set = -1.0;
            noRiseSet(transit.t_trnsit, callback);
            isPrtrnsit = true;
            //goto prtrnsit;
          } else {
            if (++loopctr > 10) {
              // Set time did not converge
              transit.f_trnsit = 0;
              isPrtrnsit = true;
              //goto prtrnsit;
            } else {
              t1 = date + transit.r_set / constant.TPI;
              if (t1 < transit.t_trnsit) {
                date += 1.0;
                t1 = date + transit.r_set / constant.TPI;
              }
            }
          }
        } while (Math.abs(t1 - t0) > 0.0001);

        if (!isPrtrnsit) {
          transit.t_set = t1;
          transit.r_trnsit = trnsit1;
          transit.r_rise = rise1;
        }
      }
    }
    // prtrnsit:
    result.localMeridianTransit = toGregorian({ julian: transit.t_trnsit });
    if (transit.t_rise != -1.0) {
      result.riseDate = toGregorian({ julian: transit.t_rise });
    }
    if (transit.t_set != -1.0) {
      result.setDate = toGregorian({ julian: transit.t_set });
      if (transit.t_rise != -1.0) {
        t0 = transit.t_set - transit.t_rise;
        if (t0 > 0.0 && t0 < 1.0) {
          result.visibleHaours = 24.0 * t0;
        }
      }
    }

    if (
      Math.abs(bodies.earth.position.date.julian - transit.t_rise) > 0.5 &&
      Math.abs(bodies.earth.position.date.julian - transit.t_trnsit) > 0.5 &&
      Math.abs(bodies.earth.position.date.julian - transit.t_set) > 0.5
    ) {
      // wrong event date
      result.wrongEventDate = true;
    }
  }
  // no_trnsit:
  //JD = JDsave;
  //TDT = TDTsave;
  //UT = UTsave;
  /* Reset to original input date entry.  */
  // update();
  //prtflg = prtsave;
  transit.f_trnsit = 1;
  return result;
};

/* If the initial approximation fails to locate a rise or set time,
 this function steps between the transit time and the previous
 or next inferior transits to find an event more reliably.  */
export const noRiseSet = function(t0, callback) {
  var t_trnsit0 = transit.t_trnsit; // double
  var el_trnsit0 = transit.elevation_trnsit; // double
  var t, e; // double
  var t_above, el_above, t_below, el_below; // double

  /* Step time toward previous inferior transit to find
   whether a rise event was missed.  The step size is a function
   of the azimuth and decreases near the transit time.  */
  t_above = t_trnsit0;
  el_above = el_trnsit0;
  t_below = -1.0;
  el_below = el_above;
  t = t_trnsit0 - 0.25;
  e = 1.0;
  while (e > 0.005) {
    iterator(t, callback);
    if (altaz.elevation > transit.elevation_threshold) {
      /* Object still above horizon.  */
      t_above = t;
      el_above = altaz.elevation;
    } else {
      /* Object is below horizon.  Rise event is bracketed.
       Proceed to interval halving search.  */
      t_below = t;
      el_below = altaz.elevation;
      break; // goto search_rise;
    }
    /* Step time by an amount proportional to the azimuth deviation.  */
    e = altaz.azimuth / 360.0;
    if (altaz.azimuth < 180.0) {
      if (transit.southern_hemisphere == 0) {
        t -= transit.STEP_SCALE * e;
      } else {
        t += transit.STEP_SCALE * e;
      }
    } else {
      e = 1.0 - e;
      if (transit.southern_hemisphere == 0) {
        t += transit.STEP_SCALE * e;
      } else {
        t -= transit.STEP_SCALE * e;
      }
    }
  }

  /* No rise event detected.  */
  if (altaz.elevation > transit.elevation_threshold) {
    /* printf ("Previous inferior transit is above horizon.\n"); */
    transit.t_rise = -1.0;
    // goto next_midnight;
  } else {
    /* Find missed rise time. */
    // search_rise:
    transit.t_rise = searchHalve(t_below, el_below, t_above, el_above, callback);
    transit.f_trnsit = 1;
  }

  // next_midnight:
  /* Step forward in time toward the next inferior transit.  */
  t_above = t_trnsit0;
  el_above = el_trnsit0;
  t_below = -1.0;
  el_below = el_above;
  t = t_trnsit0 + 0.25;
  e = 1.0;
  while (e > 0.005) {
    iterator(t, callback);
    if (altaz.elevation > transit.elevation_threshold) {
      /* Object still above horizon.  */
      t_above = t;
      el_above = altaz.elevation;
    } else {
      /* Object is below horizon.  Event is bracketed.
       Proceed to interval halving search.  */
      t_below = t;
      el_below = altaz.elevation;
      break; // goto search_set;
    }
    /* Step time by an amount proportional to the azimuth deviation.  */
    e = altaz.azimuth / 360.0;
    if (altaz.azimuth < 180.0) {
      if (transit.southern_hemisphere == 0) {
        t -= transit.STEP_SCALE * e;
      } else {
        t += transit.STEP_SCALE * e; /* Southern hemisphere observer.  */
      }
    } else {
      e = 1.0 - e;
      if (transit.southern_hemisphere == 0) {
        t += transit.STEP_SCALE * e;
      } else {
        t -= transit.STEP_SCALE * e;
      }
    }
  }

  if (altaz.elevation > transit.elevation_threshold) {
    /* printf ("Next inferior transit is above horizon.\n"); */
    transit.t_set = -1.0;
    // return 0;
  } else {
    /* Find missed set time. */
    // search_set:
    transit.t_set = searchHalve(
      t,
      altaz.elevation,
      transit.t_trnsit,
      transit.elevation_trnsit,
      callback
    );
    transit.f_trnsit = 1;
  }
};

/* Search rise or set time by simple interval halving
 after the event has been bracketed in time.  */
export const searchHalve = function(t1, y1, t2, y2, callback) {
  var e2, em, tm, ym; // double

  e2 = y2 - transit.elevation_threshold;
  // e1 = y1 - transit.elevation_threshold;
  tm = 0.5 * (t1 + t2);

  while (Math.abs(t2 - t1) > 0.00001) {
    /* Evaluate at middle of current interval.  */
    tm = 0.5 * (t1 + t2);
    iterator(tm, callback);
    ym = altaz.elevation;
    em = ym - transit.elevation_threshold;
    /* Replace the interval boundary whose error has the same sign as em.  */
    if (em * e2 > 0) {
      y2 = ym;
      t2 = tm;
      e2 = em;
    } else {
      y1 = ym;
      t1 = tm;
      // e1 = em;
    }
  }
  return tm;
};

export default transit;
