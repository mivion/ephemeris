import { constant } from './utilities/constant'
import { body } from './utilities/body'
import { kepler } from './utilities/kepler'
import { processor } from './utilities/processor'
import  { julian } from './utilities/julian'
import { delta } from './utilities/delta'
import { sun } from './utilities/sun'

export default class Ephemeris {
  // TODO: refactor library to use 0 - 11 months instead of 1 - 12 months
  constructor({ day=0, month=0, year=0, hours=0, minutes=0, seconds=0, longitude=0.00, latitude=0.00, height=0 }={}) {
    this.Constant = constant
    this.Constant.date = { day: day, month: month, year: year, hours: hours, minutes: minutes, seconds: seconds }
    this.Constant.tlong = longitude
    this.Constant.glat = latitude
    this.Constant.height = height
    this.Constant = kepler.init(constant)
    this.Constant.date = julian.calc(this.Constant.date) // TODO - refactor Date to be its own class with these methods on init
    this.Constant.date = delta.calc(this.Constant.date, this.Constant) // TODO - refactor Date to be its own class with these methods on init
    this.Constant.date = julian.universalCalc(this.Constant.date) // TODO - refactor Date to be its own class with these methods on init

    this.Body = body
    this.Earth = kepler.calc(this.Constant.date, this.Body.earth)

    this.CalculateBody = this.CalculateBody.bind(this)
  }

  CalculateBody(bodyKey) {
    let bodyObject = {}
    switch(bodyKey) {
      case 'sun':
        bodyObject = body.sun
        return sun.calc(bodyObject, {...this.Earth}, this.Constant) // TODO: Earth object mutation occurs in sun.calc(). refactor...
      default:
        throw new Error(`Celestial body with key: "${bodyKey}" not found.`)
        break
    }

  }
}
