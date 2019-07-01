const Clight = 2.99792458e5; /* Speed of light, km/sec */
const au = 1.49597870691e8; /* Astronomical unit, in kilometers. */
const aearth = 6378137.0; /* Radius of the earth, in meters. */

const constant = {
  /* Standard epochs.  Note Julian epochs (J) are measured in years of 365.25 days. */
  j2000: 2451545.0 /* 2000 January 1.5 */,
  b1950: 2433282.423 /* 1950 January 0.923 Besselian epoch */,
  j1900: 2415020.0 /* 1900 January 0, 12h UT */,
  RTOH: 12.0 / Math.PI /* Radians to hours, minutes, seconds */,

  /* Conversion factors between degrees and radians */
  DTR: 1.7453292519943295769e-2,
  RTD: 5.7295779513082320877e1,
  RTS: 2.0626480624709635516e5 /* arc seconds per radian */,
  STR: 4.8481368110953599359e-6 /* radians per arc second */,

  TPI: 2.0 * Math.PI,

  flat: 298.257222 /* flattening of the ellipsoid */,

  Rearth: (0.001 * aearth) / au /* Radius of the earth in au */,

  /* Constants used elsewhere. These are DE403 values. */
  aearth,
  au,
  emrat: 81.300585 /* Earth/Moon mass ratio.  */,
  Clightaud: (86400.0 * Clight) / au /* C in au/day  */
};

export default constant;
