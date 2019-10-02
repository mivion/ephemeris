/* Standard epochs.  Note Julian epochs (J) are measured in
 * years of 365.25 days.
 */
export const J2000 = 2451545.0 /* 2000 January 1.5 */
export const B1950 = 2433282.423 /* 1950 January 0.923 Besselian epoch */
export const J1900 = 2415020.0 /* 1900 January 0, 12h UT */
export const RTOH = 12.0 / Math.PI /* Radians to hours, minutes, seconds */

export const EMRAT = 81.300585  /* Earth/Moon mass ratio.  */


/* Conversion factors between degrees and radians */
export const DTR = 1.7453292519943295769e-2
export const RTD = 5.7295779513082320877e1
export const RTS = 2.0626480624709635516e5 /* arc seconds per radian */
export const STR = 4.8481368110953599359e-6 /* radians per arc second */
export const TPI = 2.0 * Math.PI

/* Distance from observer to center of earth, in earth radii
 */
export const FLAT = 298.257222
export const AU = 1.49597870691e8 /* Astronomical unit, in kilometers.  */
export const AEARTH = 6378137  /* Radius of the earth, in meters.  */
export const CLIGHT = 2.99792458e5  /* Speed of light, km/sec  */
export const CLIGHTAUD = 86400.0 * CLIGHT / AU; /* C in au/day  */


/* Radius of the earth in au
 Thanks to Min He <Min.He@businessobjects.com> for pointing out
 this needs to be initialized early.  */
export const REARTH = 0.001 * AEARTH / AU; // calculated in kinit

/* Earth radii per au */
export const DISFAC = 2.3454780e4

/* cosine of 90 degrees 50 minutes: */
export const COSSUN = -0.014543897651582657
/* cosine of 90 degrees 34 minutes: */
export const COSZEN = -9.8900378587411476e-3
