import { julian } from '../../src/utilities/julian'
const defaultOrigin = {year: 2000, month: 1, day: 1, hours: 0, minutes: 0, seconds: 0} // Jan 1st. 2000 0:00:00,

describe('calcJulianDate', () => {
  test('calculates Julian Date jan 1 2000', () => {
    expect(julian.calcJulianDate({year: 2000, month: 1, day: 1, hours: 0, minutes: 0, seconds: 0})).toEqual(2451544.5)
  })

  test('calculates Julian Date june 1 2000', () => {
    expect(julian.calcJulianDate({year: 2000, month: 6, day: 1, hours: 0, minutes: 0, seconds: 0})).toEqual(2451696.5)
  })

  test('calculates Julian Date dec 1 2000', () => {
    expect(julian.calcJulianDate({year: 2000, month: 12, day: 1, hours: 0, minutes: 0, seconds: 0})).toEqual(2451879.5)
  })

  test('calculates Julian Date jan 1 1975', () => {
    expect(julian.calcJulianDate({year: 1975, month: 1, day: 1, hours: 0, minutes: 0, seconds: 0})).toEqual(2442413.5)
  })

  test('calculates Julian Date june 1 1975', () => {
    expect(julian.calcJulianDate({year: 1975, month: 6, day: 1, hours: 0, minutes: 0, seconds: 0})).toEqual(2442564.5)
  })

  test('calculates Julian Date dec 1 1975', () => {
    expect(julian.calcJulianDate({year: 1975, month: 12, day: 1, hours: 0, minutes: 0, seconds: 0})).toEqual(2442747.5)
  })

  test('calculates Julian Date jan 1 2050', () => {
    expect(julian.calcJulianDate({year: 2050, month: 1, day: 1, hours: 0, minutes: 0, seconds: 0})).toEqual(2469807.5)
  })

  test('calculates Julian Date june 1 2050', () => {
    expect(julian.calcJulianDate({year: 2050, month: 6, day: 1, hours: 0, minutes: 0, seconds: 0})).toEqual(2469958.5)
  })

  test('calculates Julian Date dec 1 2050', () => {
    expect(julian.calcJulianDate({year: 2050, month: 12, day: 1, hours: 0, minutes: 0, seconds: 0})).toEqual(2470141.5)
  })
})


test('calculates Gregorian Date', () => {
  const jd = 2451544.5 // jan 1 2000
  expect(julian.toGregorian(jd)).toEqual({"day": 1, "hours": 0, "milliseconds": 0, "minutes": 0, "month": 1, "seconds": 0, "year": 2000})
})
