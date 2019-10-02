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

    it('calculates the Moon', () => {
      expect(ephemeris.CalculateBody('moon').position.apparentLongitudeString).toEqual("217°17'3\"")
      expect(ephemeris.CalculateBody('moon').position.apparentLongitude).toEqual(217.28435008107076)

      expect(ephemeris.CalculateBody('moon').position.Semidiameter.seconds).toEqual(54.08744547118285)

      expect(ephemeris.CalculateBody('moon').position.nutation.dRA).toEqual(-0.8377353595241296);
    	expect(ephemeris.CalculateBody('moon').position.nutation.dDec).toEqual(7.884225007355425);

    	expect(ephemeris.CalculateBody('moon').position.geometric.longitude).toEqual(-142.71159465087155);
    	expect(ephemeris.CalculateBody('moon').position.geometric.latitude).toEqual(5.23132586086829);
    	expect(ephemeris.CalculateBody('moon').position.geometric.distance).toEqual(0.15355593511588272);

    	expect(ephemeris.CalculateBody('moon').position.apparentGeocentric.longitude).toEqual(3.7923273219706926);
    	expect(ephemeris.CalculateBody('moon').position.apparentGeocentric.latitude).toEqual(0.09130386051687844);
    	expect(ephemeris.CalculateBody('moon').position.apparentGeocentric.distance).toEqual(62.86016884434851);

    	expect(ephemeris.CalculateBody('moon').position.dHorizontalParallax).toEqual(0.015908996146907033);

    	expect(ephemeris.CalculateBody('moon').position.sunElongation).toEqual(62.70937512973823);
    	expect(ephemeris.CalculateBody('moon').position.illuminatedFraction).toEqual(0.2718262029195282);

    	expect(ephemeris.CalculateBody('moon').position.apparent.dRA).toEqual(3.7814473341623236);
    	expect(ephemeris.CalculateBody('moon').position.apparent.dDec).toEqual(-0.15693166256853608);

    	expect(ephemeris.CalculateBody('moon').position.altaz.diurnalAberation.ra).toEqual(3.781446167769749);
    	expect(ephemeris.CalculateBody('moon').position.altaz.diurnalAberation.dec).toEqual(-0.15693168722230524);

    	expect(ephemeris.CalculateBody('moon').position.altaz.diurnalParallax.ra).toEqual( 3.779823523994774);
    	expect(ephemeris.CalculateBody('moon').position.altaz.diurnalParallax.dec).toEqual(-0.1652988947491685);

    	expect(ephemeris.CalculateBody('moon').position.altaz.atmosphericRefraction.deg).toEqual(0);
    	expect(ephemeris.CalculateBody('moon').position.altaz.atmosphericRefraction.dRA).toEqual(0);
    	expect(ephemeris.CalculateBody('moon').position.altaz.atmosphericRefraction.dDec).toEqual(-5.7249984266343304e-11);

    	expect(ephemeris.CalculateBody('moon').position.altaz.topocentric.altitude).toEqual(-57.38373112405539);
    	expect(ephemeris.CalculateBody('moon').position.altaz.topocentric.ra).toEqual(-2.503361783184812);
    	expect(ephemeris.CalculateBody('moon').position.altaz.topocentric.dec).toEqual(-0.16529889474916878);
    	expect(ephemeris.CalculateBody('moon').position.altaz.topocentric.azimuth).toEqual(345.8000378405458);
    })
  })
})
