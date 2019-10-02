import { julian } from '../../src/utilities/julian'
const defaultOrigin = {year: 2000, month: 1, day: 1, hours: 0, minutes: 0, seconds: 0, longitude: -71.13, latitude: 42.27} // Jan 1st. 2000 0:00:00,

test('calculates Julian Date', () => {
  expect(julian.calc(defaultOrigin).julian).toEqual(2451544.5)
})

test('calculates Gregorian Date', () => {
  const jd = { julian: 2451544.5 }
  expect(julian.toGregorian(jd)).toEqual({"day": 1, "hours": 0, "julian": 2451544.5, "milliseconds": 0, "minutes": 0, "month": 1, "seconds": 0, "year": 2000})
})
