import { J2000, B1950, J1900 } from '../constants'
import { util, copy } from './util'

export const julian = {
  calcJulianDate: ({year=0, month=0, day=0, hours=0, minutes=0, seconds=0}={}) => {
    //////////
    // * int year (1...)
    // * int month (1...12)
    // * int date = (1...31)
    // * float ut = universal time
    // => Returns Float || the Julian Date given the specific Gregorian calendar date
    year = year + 4800;
    if (year < 0) { year += 1; }

    if (month <= 2) {
      month += 12;
      year -= 1;
    }


    const centuries = Math.floor (year / 100);
    const e = Math.floor ((306 * (month + 1)) / 10);
    const c = Math.floor ((36525 * year) / 100); // Julian calendar years and leap years
    let b = 0;

  	/* The origin should be chosen to be a century year
  	 * that is also a leap year.  We pick 4801 B.C.
  	 */

  	/* The following magic arithmetic calculates a sequence
  	 * whose successive terms differ by the correct number of
  	 * days per calendar month.  It starts at 122 = March; January
  	 * and February come after December.
  	 */

  	if (year <= 1582) {
  		if (year == 1582) {
  			if (month < 10) {
  				b = -38;
  			}
  			if (month > 10 || day >= 15) {
  				// number of century years that are not leap years
  				b = Math.floor ((centuries / 4) - centuries);
  			}
  		}
  		else { b = -38; } //**** additional line to fix the bug *****
  	} else {
  		b = Math.floor ((centuries / 4) - centuries);
  	}

  	/* Add up these terms, plus offset from J 0 to 1 Jan 4801 B.C.
  	 * Also fudge for the 122 days from the month algorithm.
  	 */
  	const julianDate = b + c + e + day - 32167.5;

  	// Add time
  	const julianTime = (3600.0 * hours + 60.0 * minutes + seconds) / 86400.0;

  	return julianDate + julianTime;
  },
  calcJ2000: julianDate => {
    return 2000.0 + (julianDate - J2000) / 365.25;
  },
  calcB1950: julianDate => {
    return 1950.0 + (julianDate - B1950) / 365.25;
  },
  calcJ1900: julianDate => {
    return  1900.0 + (julianDate - J1900) / 365.25;
  },

  calcUniversalDate: universalJulian => {
    const gregorian = julian.toGregorian(universalJulian);

    const date = new Date(Date.UTC(gregorian.year, (gregorian.month - 1), gregorian.day, gregorian.hours, gregorian.minutes, gregorian.seconds, gregorian.milliseconds))

    return date
  },

  toGregorian: julianDate => {
    let date = {}
  	var month, day; // int
  	var year, a, c, d, x, y, jd; // int
  	var BC; // int
  	var dd; // double

  	/* January 1.0, 1 A.D. */
  	if( julianDate < 1721423.5 ) {
  		BC = 1;
  	} else {
  		BC = 0;
  	}

  	jd = Math.floor (julianDate + 0.5); /* round Julian date up to integer */

  	/* Find the number of Gregorian centuries
  	 * since March 1, 4801 B.C.
  	 */
  	a = Math.floor ((100 * jd + 3204500)/3652425);

  	/* Transform to Julian calendar by adding in Gregorian century years
  	 * that are not leap years.
  	 * Subtract 97 days to shift origin of JD to March 1.
  	 * Add 122 days for magic arithmetic algorithm.
  	 * Add four years to ensure the first leap year is detected.
  	 */
  	c = jd + 1486;
  	if( jd >= 2299160.5 ) {
  		c += a - Math.floor (a / 4);
  	} else {
  		c += 38;
  	}
  	/* Offset 122 days, which is where the magic arithmetic
  	 * month formula sequence starts (March 1 = 4 * 30.6 = 122.4).
  	 */
  	d = Math.floor ((100 * c - 12210)/36525);
  	/* Days in that many whole Julian years */
  	x = Math.floor ((36525 * d) / 100);

  	/* Find month and day. */
  	y = Math.floor (((c-x) * 100) / 3061);
  	day = Math.floor (c - x - Math.floor ((306 * y) / 10));
  	month = Math.floor (y - 1);
  	if ( y > 13 ) {
  		month -= 12;
  	}

  	/* Get the year right. */
  	year = d - 4715;
  	if (month > 2 ) {
  		year -= 1;
  	}

  	/* Fractional part of day. */
  	dd = day + julianDate - jd + 0.5;

  	if (BC) {
  		year = year - 1;
  	}

  	date.year = year;
  	date.month = month;

  	date.day = Math.floor (dd);

  	/* Display fraction of calendar day
  	 * as clock time.
  	 */
  	a = Math.floor (dd);
  	dd = dd - a;
  	x = 2.0 * Math.PI * dd;
    date = {...date, ...util.hms(x)}

  	return date;
  }
};
