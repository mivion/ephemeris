import Observer from '../../src/classes/Observer'

describe('Observer', () => {
  describe ('Constructor', () => {
    it ('validates inputs', () => {
        expect(() => new Observer({year: -1, month: 1, day: 1, hours: 1, minutes: 0, seconds: 1, latitude: 0, longitude: 0})).toThrowError("The year: \"-1\" - must be an integer and > 0 (C.E.)")

        expect(() => new Observer({year: 1, month: 12, day: 1, hours: 1, minutes: 0, seconds: 1, latitude: 0, longitude: 0})).toThrowError("The month: \"12\" - must be an integer and between 0 - 11. (0 = January, 11 = December)")

        expect(() => new Observer({year: 1, month: 1, day: 0, hours: 1, minutes: 0, seconds: 1, latitude: 0, longitude: 0})).toThrowError("The day: \"0 must be between 1 - 31")

        expect(() => new Observer({year: 1, month: 1, day: 1, hours: 24, minutes: 0, seconds: 1, latitude: 0, longitude: 0})).toThrowError("The hour: \"24\" - must be an integer and between 0 - 23. (0 = midnight 00:00, 23 = 11pm (23:00))")

        expect(() => new Observer({year: 1, month: 1, day: 1, hours: 1, minutes: 60, seconds: 1, latitude: 0, longitude: 0})).toThrowError("The minute: \"60\" - must be an integer and between 0 - 59")

        expect(() => new Observer({year: 1, month: 1, day: 1, hours: 1, minutes: 0, seconds: 60, latitude: 0, longitude: 0})).toThrowError("The second: \"60\" - must be an integer and between 0 - 59")

        expect(() => new Observer({year: 1, month: 1, day: 1, hours: 1, minutes: 0, seconds: 0, latitude: -91, longitude: 0})).toThrowError("The latitude: \"-91\" - must be an float and between -90.00 to 90.00")

        expect(() => new Observer({year: 1, month: 1, day: 1, hours: 1, minutes: 0, seconds: 0, latitude: 0, longitude: 181})).toThrowError("The longitude: \"181\" - must be an float and between -180.00 to 180.00")

        expect(() => new Observer({year: 1, month: 1, day: 1, hours: 1, minutes: 0, seconds: 0, latitude: 0, longitude: 0, height: "0"})).toThrowError("Parameter value of: \"0\" - must be a number (int or float type).")
    })
  })
})
