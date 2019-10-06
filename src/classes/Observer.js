import { AEARTH, DTR, FLAT, RTD } from '../constants'

export default class Observer {
  constructor({latitude = 0.00, longitude = 0.00, height = 0.00}={}) {
    this.glat = latitude // geodetic latitude
    this.tlat // calculated geocentric latitude
    this.tlong = longitude
    this.trho // calculated
    this.height = height
    this.attemp = 12.0,	/* atmospheric temperature, degrees Centigrade */ // input for kinit
    this.atpress = 1010.0, /* atmospheric pressure, millibars */ // input for kinit

    this.initialize = this.initialize.bind(this)

    this.initialize()
  }

  initialize() {
    // assigns tlat and trho
    /* Reduction from geodetic latitude to geocentric latitude
    * AA page K5
    */
    let a, b, fl, co, si, u; // double

    u = this.glat * DTR;

    co = Math.cos(u);
    si = Math.sin(u);
    fl = 1.0 - 1.0 / FLAT;
    fl = fl*fl;
    si = si*si;
    u = 1.0/Math.sqrt( co*co + fl*si );
    a = AEARTH*u + this.height;
    b = AEARTH*fl*u  +  this.height;

    this.trho = Math.sqrt( a*a*co*co + b*b*si );
    this.tlat = RTD * Math.acos( a*co/this.trho );

    if( this.glat < 0.0 ) {
      this.tlat = -this.tlat;
    }

    this.trho /= AEARTH;
  }
}
