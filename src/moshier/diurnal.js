import { zatan2, showcor } from './util';
import constant from './constant';
import variable from './variable';

const diurnal = {
  /* Earth radii per au. */
  DISFAC: 0.0
};

/* Diurnal aberration
 * This formula is less rigorous than the method used for
 * annual aberration.  However, the correction is small.
 */
export const aberration = function(last, ra, dec, result) {
  var lha, coslha, sinlha, cosdec, sindec; // double
  var coslat, N, D; // double

  result = result || {};
  result.ra = ra;
  result.dec = dec;

  lha = last - result.ra;
  coslha = Math.cos(lha);
  sinlha = Math.sin(lha);
  cosdec = Math.cos(result.dec);
  sindec = Math.sin(result.dec);
  coslat = Math.cos(constant.DTR * variable.tlat);

  if (cosdec != 0.0) N = (1.5472e-6 * variable.trho * coslat * coslha) / cosdec;
  else N = 0.0;
  result.ra += N;

  D = 1.5472e-6 * variable.trho * coslat * sinlha * sindec;
  result.dec += D;

  result.dRA = (constant.RTS * N) / 15.0;
  result.dDec = constant.RTS * D;

  return result;
};

/* Diurnal parallax, AA page D3 */
export const parallax = function(last, ra, dec, dist, result) {
  var cosdec, sindec, coslat, sinlat; // double
  var p = [],
    dp = [],
    x,
    y,
    z,
    D; // double

  result = result || {};
  result.ra = ra;
  result.dec = dec;

  /* Don't bother with this unless the equatorial horizontal parallax is at least 0.005" */
  if (dist > 1758.8) {
    return result;
  }

  diurnal.DISFAC = constant.au / (0.001 * constant.aearth);
  cosdec = Math.cos(result.dec);
  sindec = Math.sin(result.dec);

  /* Observer's astronomical latitude */
  x = variable.tlat * constant.DTR;
  coslat = Math.cos(x);
  sinlat = Math.sin(x);

  /* Convert to equatorial rectangular coordinates in which unit distance = earth radius */
  D = dist * diurnal.DISFAC;
  p[0] = D * cosdec * Math.cos(result.ra);
  p[1] = D * cosdec * Math.sin(result.ra);
  p[2] = D * sindec;

  dp[0] = -variable.trho * coslat * Math.cos(last);
  dp[1] = -variable.trho * coslat * Math.sin(last);
  dp[2] = -variable.trho * sinlat;

  x = p[0] + dp[0];
  y = p[1] + dp[1];
  z = p[2] + dp[2];
  D = x * x + y * y + z * z;
  D = Math.sqrt(D); /* topocentric distance */

  /* recompute ra and dec */
  result.ra = zatan2(x, y);
  result.dec = Math.asin(z / D);
  showcor(p, dp, result);
  return result;
};

export default diurnal;
