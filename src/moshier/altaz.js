import { hms, dms, zatan2 } from './util';
import { calc as siderialCalc } from './siderial';
import { aberration, parallax } from './diurnal';
import { calc as transitCalc } from './transit';
import { calc as refractionCalc } from './refraction';
import constant from './constant';
import input from './input';

const altaz = {
  azimuth: 0.0,
  elevation: 0.0,
  refracted_elevation: 0.0
};

export const calc = function(pol, date, result) {
  var dec, cosdec, sindec, lha, coslha, sinlha; // double
  var ra, dist, last, alt, az, coslat, sinlat; // double
  var N, D, x, y, z; // double

  result = result || {};

  ra = pol[0];
  dec = pol[1];
  dist = pol[2];

  /* local apparent sidereal time, seconds converted to radians */
  last = (siderialCalc(date, input.tlong) * constant.DTR) / 240.0;
  lha = last - ra; /* local hour angle, radians */
  result.dLocalApparentSiderialTime = last;
  result.localApparentSiderialTime = hms(last);

  /* Display rate at which ra and dec are changing */
  /*
   *if( prtflg )
   *  {
   *  x = RTS/24.0;
   *  N = x*dradt;
   *  D = x*ddecdt;
   *  if( N != 0.0 )
   *    printf( "dRA/dt %.2f\"/h, dDec/dt %.2f\"/h\n", N, D );
   *  }
   */

  result.diurnalAberation = aberration(last, ra, dec);
  ra = result.diurnalAberation.ra;
  dec = result.diurnalAberation.dec;

  /* Do rise, set, and transit times
   trnsit.c takes diurnal parallax into account,
   but not diurnal aberration.  */
  lha = last - ra;
  result.transit = transitCalc(date, lha, dec);

  /* Diurnal parallax */
  result.diurnalParallax = parallax(last, ra, dec, dist);
  ra = result.diurnalParallax.ra;
  dec = result.diurnalParallax.dec;

  /* Diurnal aberration */
  /*diurab( last, &ra, &dec );*/

  /* Convert ra and dec to altitude and azimuth */
  cosdec = Math.cos(dec);
  sindec = Math.sin(dec);
  lha = last - ra;
  coslha = Math.cos(lha);
  sinlha = Math.sin(lha);

  /* Use the geodetic latitude for altitude and azimuth */
  x = constant.DTR * input.glat;
  coslat = Math.cos(x);
  sinlat = Math.sin(x);

  N = -cosdec * sinlha;
  D = sindec * coslat - cosdec * coslha * sinlat;
  az = constant.RTD * zatan2(D, N);
  alt = sindec * sinlat + cosdec * coslha * coslat;
  alt = constant.RTD * Math.asin(alt);

  /* Store results */
  altaz.azimuth = az;
  altaz.elevation = alt; /* Save unrefracted value. */

  /* Correction for atmospheric refraction
   * unit = degrees
   */
  D = refractionCalc(alt);
  alt += D;
  altaz.refracted_elevation = alt;

  /* Convert back to R.A. and Dec. */
  y = Math.sin(constant.DTR * alt);
  x = Math.cos(constant.DTR * alt);
  z = Math.cos(constant.DTR * az);
  sinlha = -x * Math.sin(constant.DTR * az);
  coslha = y * coslat - x * z * sinlat;
  sindec = y * sinlat + x * z * coslat;
  lha = zatan2(coslha, sinlha);

  y = ra; /* save previous values, before refrac() */
  z = dec;
  dec = Math.asin(sindec);
  ra = last - lha;
  y = ra - y; /* change in ra */
  while (y < -Math.PI) {
    y += constant.TPI;
  }
  while (y > Math.PI) {
    y -= constant.TPI;
  }
  y = (constant.RTS * y) / 15.0;
  z = constant.RTS * (dec - z);

  result.atmosphericRefraction = {
    deg: D,
    dRA: y,
    dDec: z
  };

  result.topocentric = {
    altitude: alt,
    azimuth: az,
    ra: ra,
    dec: dec,
    dRA: hms(ra),
    dDec: dms(dec)
  };

  return result;
};

export default altaz;
