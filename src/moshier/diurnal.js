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
  result = result || {};
  result.ra = ra;
  result.dec = dec;

  const lha = last - result.ra;
  const coslha = Math.cos(lha);
  const sinlha = Math.sin(lha);
  const cosdec = Math.cos(result.dec);
  const sindec = Math.sin(result.dec);
  const coslat = Math.cos(constant.DTR * variable.tlat);

  const N = cosdec != 0.0 ? (1.5472e-6 * variable.trho * coslat * coslha) / cosdec : 0.0;
  result.ra += N;

  const D = 1.5472e-6 * variable.trho * coslat * sinlha * sindec;
  result.dec += D;

  result.dRA = (constant.RTS * N) / 15.0;
  result.dDec = constant.RTS * D;

  return result;
};

/* Diurnal parallax, AA page D3 */
export const parallax = function(last, ra, dec, dist, result) {
  result = result || {};
  result.ra = ra;
  result.dec = dec;

  /* Don't bother with this unless the equatorial horizontal parallax is at least 0.005" */
  if (dist > 1758.8) {
    return result;
  }

  diurnal.DISFAC = constant.au / (0.001 * constant.aearth);
  const cosdec = Math.cos(result.dec);
  const sindec = Math.sin(result.dec);

  /* Observer's astronomical latitude */
  const xx = variable.tlat * constant.DTR;
  const coslat = Math.cos(xx);
  const sinlat = Math.sin(xx);

  /* Convert to equatorial rectangular coordinates in which unit distance = earth radius */
  const D = dist * diurnal.DISFAC;
  const p = [];
  p[0] = D * cosdec * Math.cos(result.ra);
  p[1] = D * cosdec * Math.sin(result.ra);
  p[2] = D * sindec;

  const dp = [];
  dp[0] = -variable.trho * coslat * Math.cos(last);
  dp[1] = -variable.trho * coslat * Math.sin(last);
  dp[2] = -variable.trho * sinlat;

  const x = p[0] + dp[0];
  const y = p[1] + dp[1];
  const z = p[2] + dp[2];
  const D2 = x * x + y * y + z * z;
  const D3 = Math.sqrt(D2); /* topocentric distance */

  /* recompute ra and dec */
  result.ra = zatan2(x, y);
  result.dec = Math.asin(z / D3);
  showcor(p, dp, result);
  return result;
};

export default diurnal;
