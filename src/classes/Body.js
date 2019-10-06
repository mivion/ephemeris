import { celestialBodies } from '../constants/celestialBodies'

export default class Body {
  constructor(key) {
    this._key = key

    this.locals = {}
    this.locals.dp = [] // correction vector, saved for display
    this.locals.dradt = null; // approx motion of right ascension of object in radians p day
  	this.locals.ddecdt = null; // approx motion of declination of object in radians p day
    this.locals.EO = 0.0;  /* earth-sun distance */
  	this.locals.SE = 0.0;  /* object-sun distance */
  	this.locals.SO = 0.0;  /* object-earth distance */
  	this.locals.pq = 0.0;	/* cosine of sun-object-earth angle */
  	this.locals.ep = 0.0;	/* -cosine of sun-earth-object angle */
  	this.locals.qe = 0.0;	/* cosine of earth-sun-object angle */

    this.aberration = {}
    this.lightTime = {}
    this.position = {}
    this.distance = undefined
    this.epoch = undefined
    this.semiAxis = 0.0
    this.semiDiameter = undefined

    this._body = celestialBodies.find(b => b.key === this._key)

    Object.keys(this._body).forEach(key => {
      this[key] = this._body[key]
    })
  }

  static get KeysExceptEarth() {
    return celestialBodies.filter(body => body.key !== 'earth')
  }
}
