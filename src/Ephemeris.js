import { kepler } from './utilities/kepler'
import  { julian } from './utilities/julian'
import DateDelta from './utilities/DateDelta'
import Body from './classes/Body'
import Sol from './classes/Sol'
import Luna from './classes/Luna'
import Earth from './classes/Earth'
import HeliocentricOrbitalBody from './classes/HeliocentricOrbitalBody'
import Star from './classes/Star'
import Observer from './classes/Observer'

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
  validateKey
} from './utilities/validators'


export default class Ephemeris {
  constructor({ year=0, month=0, day=0, hours=0, minutes=0, seconds=0, latitude=0.00,  longitude=0.00, height=0.00, key=undefined }={}) {
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

    this._key = validateKey(key)
    this._year = validateYear(year)
    this._month = validateMonth(month) // Reconcile month to use 1 - 12 range with legacy code
    this._day = validateDate(day)
    this._hours = validateHour(hours)
    this._minutes = validateMinute(minutes)
    this._seconds = validateSecond(seconds)
    this._latitude = validateLatitude(latitude)
    this._longitude = validateLongitude(longitude)
    this._height = validateNumber(height)

    this.Date = this.CalculateDates()

    this.Observer = new Observer({latitude: latitude, longitude: longitude, height: height})
    this.Earth = new Earth(new Body('earth'), this.Date)
    this.Results = this.CalculateResults()

    // Add each result as a key to the ephemeris object
    this.Results.forEach(result => {
      this[result.key] = result
    })

    this.CalculateDates = this.CalculateDates.bind(this)
    this.CalculateResults = this.CalculateResults.bind(this)
    this.CalculateBody = this.CalculateBody.bind(this)
  }

  // TODO - move Date to observer
  CalculateDates() {
    const dateObject = { year: this._year, month: this._month, day: this._day, hours: this._hours, minutes: this._minutes, seconds: this._seconds }
    this.Date = {}
    this.Date.utc = new Date(Date.UTC(this._year, this._month, this._day, this._hours, this._minutes, this._seconds))
    this.Date.julian = julian.calcJulianDate({...dateObject, month: dateObject.month + 1}), // month + 1 for formula
    this.Date.j2000 = julian.calcJ2000(this.Date.julian),
    this.Date.b1950 = julian.calcB1950(this.Date.julian),
    this.Date.j1900 = julian.calcJ1900(this.Date.julian),
    this.Date.universalJulian = new DateDelta().CalcUniversal(this.Date.julian, this.Date.j2000)
    this.Date.universalDate = julian.calcUniversalDate(this.Date.universalJulian)

    return this.Date
  }

  CalculateResults() {
    return !!this._key && this._key.length ? // if key array
      Body.KeysExceptEarth.filter(b => this._key.includes(b.key)).map(b => this.CalculateBody(b.key)) :
      Body.KeysExceptEarth.map(b => this.CalculateBody(b.key))
  }

  CalculateBody(bodyKey) {
    const body = new Body(bodyKey)
    switch(body.type) {
      case 'sun':
        return new Sol(body, this.Earth, this.Observer)
      case 'luna':
        return new Luna(body, this.Earth, this.Observer)
      case 'heliocentric':
        return new HeliocentricOrbitalBody(body, this.Earth, this.Observer)
      case 'star':
        return new Star(body, this.Earth, this.Observer)
      default:
        throw new Error(`Celestial body with key: "${bodyKey}" or type "${body.type}" not found.`)
        break
    }
  }
}
