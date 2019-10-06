import { kepler } from '../utilities/kepler'

export default class Earth {
  constructor(body, date) {

    this._body = this.calculateBody(body, date.julian)

    Object.keys(this._body).forEach(key => {
      this[key] = this._body[key]
    })

    this.calculateBody = this.calculateBody.bind(this)
  }

  calculateBody(body, julianDate) {
    return kepler.calc(julianDate, body)
  }
}
