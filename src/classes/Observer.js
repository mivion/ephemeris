import { AEARTH, DTR, FLAT, RTD } from '../constants'
import  { julian } from '../utilities/julian'
import DateDelta from '../utilities/DateDelta'

import {
  validateYear,
  validateMonth,
  validateDate,
  validateHour,
  validateMinute,
  validateSecond,
  validateLatitude,
  validateLongitude,
  validateNumber,
} from '../utilities/validators'

export default class Observer {
  constructor({
    latitude = 0.00, longitude = 0.00, height = 0.00,
    year=0, month=0, day=0, hours=0, minutes=0, seconds=0
  }={}) {
    // Assumes UTC time
    // * int year (> 0 C.E.)
    // * int month (0 - 11 || 0 = January, 11 = December)
    // * int day (1 - 31)
    // * int hours (0 - 23)
    // * int minutes (0 - 59)
    // * int seconds (0 - 59)
    // * float latitude (-90 - +90)
    // * float longitude (-180 - +180)
    // * float height
    // * string OR array[string] key - ex: pass in "venus" or ["mercury", "venus"] or leave blank for all

    this._year = validateYear(year)
    this._month = validateMonth(month) // Reconcile month to use 1 - 12 range with legacy code
    this._day = validateDate(day)
    this._hours = validateHour(hours)
    this._minutes = validateMinute(minutes)
    this._seconds = validateSecond(seconds)
    this._latitude = validateLatitude(latitude)
    this._longitude = validateLongitude(longitude)
    this._height = validateNumber(height)

    this.glat = latitude // geodetic latitude
    this.tlat // calculated geocentric latitude
    this.tlong = longitude
    this.trho // calculated
    this.height = height
    this.attemp = 12.0,	/* atmospheric temperature, degrees Centigrade */ // input for kinit
    this.atpress = 1010.0, /* atmospheric pressure, millibars */ // input for kinit

    this.initialize = this.initialize.bind(this)
    this.CalculateDates = this.CalculateDates.bind(this)

    this.initialize()

    this.Date = this.CalculateDates()
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

  CalculateDates() {
    const dateObject = { year: this._year, month: this._month, day: this._day, hours: this._hours, minutes: this._minutes, seconds: this._seconds }
    let date = {}
    date.utc = new Date(Date.UTC(this._year, this._month, this._day, this._hours, this._minutes, this._seconds))
    date.julian = julian.calcJulianDate({...dateObject, month: dateObject.month + 1}), // month + 1 for formula
    date.j2000 = julian.calcJ2000(date.julian),
    date.b1950 = julian.calcB1950(date.julian),
    date.j1900 = julian.calcJ1900(date.julian),
    date.universalJulian = new DateDelta().CalcUniversal(date.julian, date.j2000)
    date.universalDate = julian.calcUniversalDate(date.universalJulian)

    return date
  }
}
