import input from './input';

const TABSTART = 1620;
const TABEND = 2011;

const delta = {
  /**
   * Morrison and Stephenson (2004)
   * This table covers -1000 through 1700 in 100-year steps.
   * Values are in whole seconds.
   * Estimated standard error at -1000 is 640 seconds; at 1600, 20 seconds.
   * The first value in the table has been adjusted 28 sec for
   * continuity with their long-term quadratic extrapolation formula.
   * The last value in this table agrees with the AA table at 1700,
   * so there is no discontinuity at either endpoint.
   */
  m_s: [
    /* eslint-disable prettier/prettier */
    /* -1000 to -100 */
    25428, 23700, 22000, 21000, 19040, 17190, 15530, 14080, 12790, 11640,
    /* 0 to 900 */
    10580, 9600, 8640, 7680, 6700, 5710, 4740, 3810, 2960, 2200,
    /* 1000 to 1700 */
    1570, 1090, 740, 490, 320, 200, 120, 9
    /* eslint-enable prettier/prettier */
  ],

  /**
   * Entries prior to 1955 in the following table are from
   * the 1984 Astronomical Almanac and assume ndot = -26.0.
   * For dates prior to 1700, the above table is used instead of this one.
   */
  dt: [
    /* eslint-disable prettier/prettier */
    /* 1620.0 thru 1659.0 */
    12400, 11900, 11500, 11000, 10600, 10200, 9800, 9500, 9100, 8800,
    8500, 8200, 7900, 7700, 7400, 7200, 7000, 6700, 6500, 6300,
    6200, 6000, 5800, 5700, 5500, 5400, 5300, 5100, 5000, 4900,
    4800, 4700, 4600, 4500, 4400, 4300, 4200, 4100, 4000, 3800,
    /* 1660.0 thru 1699.0 */
    3700, 3600, 3500, 3400, 3300, 3200, 3100, 3000, 2800, 2700,
    2600, 2500, 2400, 2300, 2200, 2100, 2000, 1900, 1800, 1700,
    1600, 1500, 1400, 1400, 1300, 1200, 1200, 1100, 1100, 1000,
    1000, 1000, 900, 900, 900, 900, 900, 900, 900, 900,
    /* 1700.0 thru 1739.0 */
    900, 900, 900, 900, 900, 900, 900, 900, 1000, 1000,
    1000, 1000, 1000, 1000, 1000, 1000, 1000, 1100, 1100, 1100,
    1100, 1100, 1100, 1100, 1100, 1100, 1100, 1100, 1100, 1100,
    1100, 1100, 1100, 1100, 1200, 1200, 1200, 1200, 1200, 1200,
    /* 1740.0 thru 1779.0 */
    1200, 1200, 1200, 1200, 1300, 1300, 1300, 1300, 1300, 1300,
    1300, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1500, 1500,
    1500, 1500, 1500, 1500, 1500, 1600, 1600, 1600, 1600, 1600,
    1600, 1600, 1600, 1600, 1600, 1700, 1700, 1700, 1700, 1700,
    /* 1780.0 thru 1799.0 */
    1700, 1700, 1700, 1700, 1700, 1700, 1700, 1700, 1700, 1700,
    1700, 1700, 1600, 1600, 1600, 1600, 1500, 1500, 1400, 1400,
    /* 1800.0 thru 1819.0 */
    1370, 1340, 1310, 1290, 1270, 1260, 1250, 1250, 1250, 1250,
    1250, 1250, 1250, 1250, 1250, 1250, 1250, 1240, 1230, 1220,
    /* 1820.0 thru 1859.0 */
    1200, 1170, 1140, 1110, 1060, 1020, 960, 910, 860, 800,
    750, 700, 660, 630, 600, 580, 570, 560, 560, 560,
    570, 580, 590, 610, 620, 630, 650, 660, 680, 690,
    710, 720, 730, 740, 750, 760, 770, 770, 780, 780,
    /* 1860.0 thru 1899.0 */
    788, 782, 754, 697, 640, 602, 541, 410, 292, 182,
    161, 10, -102, -128, -269, -324, -364, -454, -471, -511,
    -540, -542, -520, -546, -546, -579, -563, -564, -580, -566,
    -587, -601, -619, -664, -644, -647, -609, -576, -466, -374,
    /* 1900.0 thru 1939.0 */
    -272, -154, -2, 124, 264, 386, 537, 614, 775, 913,
    1046, 1153, 1336, 1465, 1601, 1720, 1824, 1906, 2025, 2095,
    2116, 2225, 2241, 2303, 2349, 2362, 2386, 2449, 2434, 2408,
    2402, 2400, 2387, 2395, 2386, 2393, 2373, 2392, 2396, 2402,
    /* 1940.0 thru 1979.0 */
    2433, 2483, 2530, 2570, 2624, 2677, 2728, 2778, 2825, 2871,
    2915, 2957, 2997, 3036, 3072, 3107, 3135, 3168, 3218, 3268,
    3315, 3359, 3400, 3447, 3503, 3573, 3654, 3743, 3829, 3920,
    4018, 4117, 4223, 4337, 4449, 4548, 4646, 4752, 4853, 4959,
    /* 1980.0 thru 2011.0 */
    5054, 5138, 5217, 5296, 5379, 5434, 5487, 5532, 5582, 5630,
    5686, 5757, 5831, 5912, 5998, 6078, 6163, 6230, 6297, 6347,
    6383, 6409, 6430, 6447, 6457, 6469, 6485, 6515, 6546, 6578,
    6607, 6632
    /* eslint-enable prettier/prettier */
  ],

  demo: 0,
  TABSTART,
  TABEND,
  TABSIZ: TABEND - TABSTART + 1
};

export const calc = function(date) {
  const diff = [0, 0, 0, 0, 0, 0]; // int

  if (input.dtgiven) {
    date.delta = input.dtgiven;
  } else if (date.j2000 > delta.TABEND) {
    /* Extrapolate future values beyond the lookup table.  */
    if (date.j2000 > delta.TABEND + 100.0) {
      /* Morrison & Stephenson (2004) long-term curve fit.  */
      const B = (date.j2000 - 1820.0) / 100;
      date.delta = 32.0 * B * B - 20.0;
    } else {
      /* Cubic interpolation between last tabulated value
       and long-term curve evaluated at 100 years later.  */

      /* Last tabulated delta T value. */
      const a = delta.dt[delta.TABSIZ - 1] / 100;
      /* Approximate slope in past 10 years. */
      const b = (delta.dt[delta.TABSIZ - 1] - delta.dt[delta.TABSIZ - 11]) / 1000;

      /* Long-term curve 100 years hence. */
      const B = (delta.TABEND + 100.0 - 1820.0) / 100;
      const m0 = 32.0 * B * B - 20.0;
      /* Its slope. */
      const m1 = 0.64 * B;

      /* Solve for remaining coefficients of an interpolation polynomial
       * that agrees in value and slope at both ends of the 100-year
       * interval. */
      const d = 2.0e-6 * (50.0 * (m1 + b) - m0 + a);
      const c = 1.0e-4 * (m0 - a - 100.0 * b - 1.0e6 * d);

      /* Note, the polynomial coefficients do not depend on Y.
       A given tabulation and long-term formula
       determine the polynomial.
       Thus, for the IERS table ending at 2011.0, the coefficients are
       a = 66.32
       b = 0.223
       c = 0.03231376
       d = -0.0001607784
       */

      /* Compute polynomial value at desired time. */
      const p = date.j2000 - delta.TABEND;
      date.delta = a + p * (b + p * (c + p * d));
    }
  } else {
    /* Use Morrison and Stephenson (2004) prior to the year 1700.  */
    if (date.j2000 < 1700.0) {
      if (date.j2000 <= -1000.0) {
        /* Morrison and Stephenson long-term fit.  */
        const B = (date.j2000 - 1820.0) / 100;
        date.delta = 32.0 * B * B - 20.0;
      } else {
        /* Morrison and Stephenson recommend linear interpolation
         between tabulations. */
        let iy = Math.floor(date.j2000);
        iy = Math.floor((iy + 1000) / 100);
        /* Integer index into the table. */
        const B = -1000 + 100 * iy;
        /* Starting year of tabulated interval.  */
        const p = delta.m_s[iy];
        date.delta = p + ((date.j2000 - B) * (delta.m_s[iy + 1] - p)) / 100;
      }
    } else {
      /* Besselian interpolation between tabulated values in the telescopic era.
       * See AA page K11.
       */

      /* Index into the table.
       */
      let p = Math.floor(date.j2000);
      const iy = Math.floor(p - delta.TABSTART);
      /* Zeroth order estimate is value at start of year
       */
      date.delta = delta.dt[iy];
      let k = iy + 1;
      if (!(k >= delta.TABSIZ)) {
        /* The fraction of tabulation interval
         */
        p = date.j2000 - p;

        /* First order interpolated value
         */
        date.delta += p * (delta.dt[k] - delta.dt[iy]);
        if (!(iy - 1 < 0 || iy + 2 >= delta.TABSIZ)) {
          // make table of first differences
          k = iy - 2;
          for (let i = 0; i < 5; i++) {
            if (k < 0 || k + 1 >= delta.TABSIZ) {
              diff[i] = 0;
            } else {
              diff[i] = delta.dt[k + 1] - delta.dt[k];
            }
            k += 1;
          }

          // compute second differences
          for (let i = 0; i < 4; i++) {
            diff[i] = diff[i + 1] - diff[i];
          }
          const B = 0.25 * p * (p - 1.0);
          date.delta += B * (diff[1] + diff[2]);

          if (!(iy + 2 >= delta.TABSIZ)) {
            // Compute third differences
            for (let i = 0; i < 3; i++) {
              diff[i] = diff[i + 1] - diff[i];
            }
            const B2 = (2.0 * B) / 3.0;
            date.delta += (p - 0.5) * B2 * diff[1];
            if (!(iy - 2 < 0 || iy + 3 > delta.TABSIZ)) {
              // Compute fourth differences
              for (let i = 0; i < 2; i++) {
                diff[i] = diff[i + 1] - diff[i];
              }
              const B3 = 0.125 * B2 * (p + 1.0) * (p - 2.0);
              date.delta += B3 * (diff[0] + diff[1]);
            }
          }
        }
      }
    }
    date.delta /= 100.0;
  }

  date.terrestrial = date.julian;
  date.universal = date.terrestrial - date.delta / 86400.0;

  return date.delta;
};

export default delta;
