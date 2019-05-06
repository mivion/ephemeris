const input = {
  // input for kinit

  /* Cambridge, Massachusetts */
  tlong: -71.13 /* longitude */,
  glat: 42.27 /* geodetic latitude */,
  height: 0.0,

  /* Parameters for calculation of azimuth and elevation */
  attemp: 12.0 /* atmospheric temperature, degrees Centigrade */,
  atpress: 1010.0 /* atmospheric pressure, millibars */,

  /* If the following number is nonzero, then the program will return it for delta T and not calculate anything. */
  dtgiven: 0.0 // input for kinit
};

export default input;
