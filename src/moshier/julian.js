import { hms } from './util';
import { copy } from './common';
import constant from './constant';

export const calc = function(date) {
  /* The origin should be chosen to be a century year
   * that is also a leap year.  We pick 4801 B.C.
   */
  let year = date.year + 4800;
  if (date.year < 0) {
    year += 1;
  }

  /* The following magic arithmetic calculates a sequence
   * whose successive terms differ by the correct number of
   * days per calendar month.  It starts at 122 = March; January
   * and February come after December.
   */
  let month = date.month;
  if (month <= 2) {
    month += 12;
    year -= 1;
  }
  const e = Math.floor((306 * (month + 1)) / 10);

  // number of centuries
  const centuries = Math.floor(year / 100);

  let b = 0;
  if (date.year <= 1582) {
    if (date.year == 1582) {
      if (date.month < 10) {
        b = -38;
      }
      if (date.month > 10 || date.day >= 15) {
        // number of century years that are not leap years
        b = Math.floor(centuries / 4 - centuries);
      }
    } else {
      b = -38;
    } //**** additional line to fix the bug *****
  } else {
    b = Math.floor(centuries / 4 - centuries);
  }

  // Julian calendar years and leap years
  const c = Math.floor((36525 * year) / 100);

  /* Add up these terms, plus offset from J 0 to 1 Jan 4801 B.C.
   * Also fudge for the 122 days from the month algorithm.
   */
  date.julianDate = b + c + e + date.day - 32167.5;

  // Add time
  date.julianTime = (3600.0 * date.hours + 60.0 * date.minutes + date.seconds) / 86400.0;

  date.julian = date.julianDate + date.julianTime;

  date.j2000 = 2000.0 + (date.julian - constant.j2000) / 365.25;
  date.b1950 = 1950.0 + (date.julian - constant.b1950) / 365.25;
  date.j1900 = 1900.0 + (date.julian - constant.j1900) / 365.25;

  return date.julian;
};

export const toGregorian = function(date) {
  const J = date.julian;

  /* January 1.0, 1 A.D. */
  const BC = J < 1721423.5 ? 1 : 0;

  const jd = Math.floor(J + 0.5); /* round Julian date up to integer */

  /* Find the number of Gregorian centuries
   * since March 1, 4801 B.C.
   */
  const a = Math.floor((100 * jd + 3204500) / 3652425);

  /* Transform to Julian calendar by adding in Gregorian century years
   * that are not leap years.
   * Subtract 97 days to shift origin of JD to March 1.
   * Add 122 days for magic arithmetic algorithm.
   * Add four years to ensure the first leap year is detected.
   */
  let c = jd + 1486;
  if (jd >= 2299160.5) {
    c += a - Math.floor(a / 4);
  } else {
    c += 38;
  }
  /* Offset 122 days, which is where the magic arithmetic
   * month formula sequence starts (March 1 = 4 * 30.6 = 122.4).
   */
  const d = Math.floor((100 * c - 12210) / 36525);
  /* Days in that many whole Julian years */
  const x = Math.floor((36525 * d) / 100);

  /* Find month and day. */
  const y = Math.floor(((c - x) * 100) / 3061);
  const day = Math.floor(c - x - Math.floor((306 * y) / 10));
  let month = Math.floor(y - 1);
  if (y > 13) {
    month -= 12;
  }

  /* Get the year right. */
  let year = d - 4715;
  if (month > 2) {
    year -= 1;
  }

  /* Fractional part of day. */
  const dd = day + J - jd + 0.5;

  if (BC) {
    year = year - 1;
  }

  date.year = year;
  date.month = month;
  date.day = Math.floor(dd);

  /* Display fraction of calendar day as clock time. */
  copy(date, hms(constant.TPI * (dd - Math.floor(dd))));

  return date;
};
