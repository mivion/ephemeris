const variable = {
  tlat: 42.38 /* geocentric latitude */,
  trho: 0.9985 /* Distance from observer to center of earth, in earth radii */,

  /* approximate motion of right ascension and declination of object, in radians per day */
  dradt: 0.0,
  ddecdt: 0.0,

  SE: 0.0 /* earth-sun distance */,
  SO: 0.0 /* object-sun distance */,
  EO: 0.0 /* object-earth distance */,

  pq: 0.0 /* cosine of sun-object-earth angle */,
  ep: 0.0 /* -cosine of sun-earth-object angle */,
  qe: 0.0 /* cosine of earth-sun-object angle */,

  /* correction vector, saved for display  */
  dp: [],

  /* Current kepler body */
  body: {}
};

export default variable;
