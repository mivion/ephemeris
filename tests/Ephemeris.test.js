import Ephemeris from '../src/Ephemeris'

describe('Ephemeris', () => {
  const defaultOrigin = {
    year: 2000, month: 1, day: 1, hours: 0, minutes: 0, seconds: 0, longitude: -71.1, latitude: 41.37
  } // Jan 1st. 2000 0:00:00, Cambridge MA
  
  describe('constructor', () => {
    const ephemeris = new Ephemeris(defaultOrigin)

    it('constructs a new class without error', () => {
      expect(!!ephemeris).toEqual(true)
    })

    it('constructs Constant from input', () => {
      expect(ephemeris.Constant.date.year).toEqual(2000)
      expect(ephemeris.Constant.tlong).toEqual(-71.1)
    })

    it('constructs Body', () => {
      expect(ephemeris.Body.earth.anomaly).toEqual(1.1791)
      expect(ephemeris.Body.earth.ptable.distance).toEqual(1.000139872959708)
    })

    it('initializes Kepler constants', () => {
      expect(ephemeris.Constant.tlat).toEqual(41.17920042308457)
      expect(ephemeris.Constant.trho).toEqual(0.9985423669162051)
    })

    it('calculates dates', () => {
      // Julian
      expect(ephemeris.Constant.date.julian).toEqual(2451544.5)
      expect(ephemeris.Constant.date.j2000).toEqual(1999.9986310746065)
      // Universal
      expect(ephemeris.Constant.date.universalDate).toEqual({"day": 31, "hours": 23, "julian": 2451544.4992612316, "milliseconds": 170, "minutes": 58, "month": 12, "seconds": 56, "year": 1999})
      expect(ephemeris.Constant.date.universalDateString).toEqual("31.12.1999 23:58:56.17")
      // Delta
      expect(ephemeris.Constant.date.terrestrial).toEqual(2451544.5)
      expect(ephemeris.Constant.date.universal).toEqual(2451544.4992612316)
    })

    it('calculates Earth', () => {
      expect(ephemeris.Earth.epoch).toEqual(2451544.5)
      expect(ephemeris.Earth.distance).toEqual(0.983316965107044)
      expect(ephemeris.Earth.position.polar).toEqual([1.7430277433487111, -0.00000401331969731571, 0.9833318985267808])
      expect(ephemeris.Earth.position.rect).toEqual([-0.16852457737110144, 0.8888429510893577, 0.38535606623087776])
    })
  })

  describe('CalculateBody', () => {
    const ephemeris = new Ephemeris(defaultOrigin)

    it('calculates the Sun', () => {
      expect(ephemeris.CalculateBody('sun').position.aberration).toEqual({"dDec": 1.543790024784711, "dRA": 1.506044160265716})
      expect(ephemeris.CalculateBody('sun').position.altaz.dLocalApparentSiderialTime).toEqual(0.5037761337802859)


      expect(ephemeris.CalculateBody('sun').position.apparentLongitude).toEqual(279.85845746839465)
      expect(ephemeris.CalculateBody('sun').position.apparentLongitudeString).toEqual("279°51'30\"")


      expect(ephemeris.CalculateBody('sun').position.apparent).toEqual({"dDec": -0.40266799895209826, "dRA": 4.899579517039573, "dec": {"degree": 23, "minutes": 4, "seconds": 16.236785760549424}, "ra": {"hours": 18, "milliseconds": 55, "minutes": 42, "seconds": 54}})

      expect(ephemeris.CalculateBody('sun').position.equinoxEclipticLonLat).toEqual({"0": 4.884620063190782, "1": 0.000004016332594980136, "2": 0.9833318985267808, "3": {"degree": 279, "minutes": 52, "seconds": 5.2109247263433645}, "4": {"degree": 0, "minutes": 0, "seconds": 0.8284280645274755}})


      expect(ephemeris.CalculateBody('sun').position.altaz.atmosphericRefraction).toEqual({"dDec": -3.434999055980598e-11, "dRA": 0, "deg": 0})
      expect(ephemeris.CalculateBody('sun').position.altaz.diurnalAberation).toEqual({"dDec": -0.08931878508841723, "dRA": -0.005410752130287809, "dec": -0.40266843198178814, "ra": 4.899579123558574})
      expect(ephemeris.CalculateBody('sun').position.altaz.topocentric).toEqual({"altitude": -28.292954029774886, "azimuth": 263.16585592925907, "dDec": {"degree": 23, "minutes": 4, "seconds": 20.915465026334914}, "dRA": {"hours": 18, "milliseconds": 586, "minutes": 42, "seconds": 53}, "dec": -0.40269068182927403, "ra": -1.3836398418471454})
      expect(ephemeris.CalculateBody('sun').position.lightTime).toEqual(8.178122476657716)
    })
  })
})
