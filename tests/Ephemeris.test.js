import Ephemeris from '../src/Ephemeris'

describe('Ephemeris', () => {
  const defaultOrigin = {
    year: 2000, month: 0, day: 1, hours: 0, minutes: 0, seconds: 0, longitude: -71.1, latitude: 41.37
  } // Jan 1st. 2000 0:00:00, Cambridge MA

  describe('constructor', () => {
    test('constructs a new class without error', () => {
      const ephemeris = new Ephemeris(defaultOrigin)
      expect(!!ephemeris).toEqual(true)
    })

    test('validates inputs', () => {
      expect(() => new Ephemeris({year: -1, month: 1, day: 1, hours: 1, minutes: 0, seconds: 1, latitude: 0, longitude: 0})).toThrowError("The year: \"-1\" - must be an integer and > 0 (C.E.)")

      expect(() => new Ephemeris({year: 1, month: 12, day: 1, hours: 1, minutes: 0, seconds: 1, latitude: 0, longitude: 0})).toThrowError("The month: \"12\" - must be an integer and between 0 - 11. (0 = January, 11 = December)")

      expect(() => new Ephemeris({year: 1, month: 1, day: 0, hours: 1, minutes: 0, seconds: 1, latitude: 0, longitude: 0})).toThrowError("The day: \"0 must be between 1 - 31")

      expect(() => new Ephemeris({year: 1, month: 1, day: 1, hours: 24, minutes: 0, seconds: 1, latitude: 0, longitude: 0})).toThrowError("The hour: \"24\" - must be an integer and between 0 - 23. (0 = midnight 00:00, 23 = 11pm (23:00))")

      expect(() => new Ephemeris({year: 1, month: 1, day: 1, hours: 1, minutes: 60, seconds: 1, latitude: 0, longitude: 0})).toThrowError("The minute: \"60\" - must be an integer and between 0 - 59")

      expect(() => new Ephemeris({year: 1, month: 1, day: 1, hours: 1, minutes: 0, seconds: 60, latitude: 0, longitude: 0})).toThrowError("The second: \"60\" - must be an integer and between 0 - 59")

      expect(() => new Ephemeris({year: 1, month: 1, day: 1, hours: 1, minutes: 0, seconds: 0, latitude: -91, longitude: 0})).toThrowError("The latitude: \"-91\" - must be an float and between -90.00 to 90.00")

      expect(() => new Ephemeris({year: 1, month: 1, day: 1, hours: 1, minutes: 0, seconds: 0, latitude: 0, longitude: 181})).toThrowError("The longitude: \"181\" - must be an float and between -180.00 to 180.00")

      expect(() => new Ephemeris({year: 1, month: 1, day: 1, hours: 1, minutes: 0, seconds: 0, latitude: 0, longitude: 0, height: "0"})).toThrowError("Parameter value of: \"0\" - must be a number (int or float type).")
    })

    test('assigns _bodyData', () => {
      const ephemeris = new Ephemeris(defaultOrigin)
      expect(ephemeris._bodyData.find(b => b.key === 'earth').anomaly).toEqual(1.1791)
      expect(ephemeris._bodyData.find(b => b.key === 'earth').ptable.distance).toEqual(1.000139872959708)
    })

    test('assigns Observer', () => {
      const ephemeris = new Ephemeris(defaultOrigin)
      expect(ephemeris.Observer.glat).toEqual(41.37)
      expect(ephemeris.Observer.tlong).toEqual(-71.1)
      expect(ephemeris.Observer.height).toEqual(0)
      expect(ephemeris.Observer.attemp).toEqual(12)
      expect(ephemeris.Observer.atpress).toEqual(1010)
      expect(ephemeris.Observer.tlat).toEqual(41.17920042308457)
      expect(ephemeris.Observer.trho).toEqual(0.9985423669162051)
    })

    test('calculates dates', () => {
      const ephemeris = new Ephemeris(defaultOrigin)
      // Julian
      expect(ephemeris.Date.julian).toEqual(2451544.5)
      expect(ephemeris.Date.j2000).toEqual(1999.9986310746065)
      expect(ephemeris.Date.b1950).toEqual(1999.998841889117)
      expect(ephemeris.Date.j2000).toEqual(1999.9986310746065)

      expect(ephemeris.Date.utc).toEqual(new Date("2000-01-01T00:00:00.000Z"))
      // Universal
      expect(ephemeris.Date.universalDate).toEqual(new Date("1999-12-31T23:58:56.170Z"))
      expect(ephemeris.Date.universalJulian).toEqual(2451544.4992612316)

    })

    test('calculates Earth', () => {
      const ephemeris = new Ephemeris(defaultOrigin)
      expect(ephemeris.Earth.epoch).toEqual(2451544.5)
      expect(ephemeris.Earth.distance).toEqual(0.983316965107044)
      expect(ephemeris.Earth.position.polar).toEqual([1.7430277433487111, -0.00000401331969731571, 0.9833318985267808])
      expect(ephemeris.Earth.position.rect).toEqual([-0.16852457737110144, 0.8888429510893577, 0.38535606623087776])
    })

    test('calculates Results', () => {
      const ephemeris = new Ephemeris(defaultOrigin)
      expect(ephemeris.Results.length).toEqual(12)
    })
  })

  describe('Sun', () => {
    let ephemeris, body
    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'sun'})
      body = ephemeris.sun
    })

    test('calculates position', () => {
      expect(body.position.apparentLongitude).toEqual(279.85845746839465)
      expect(body.position.apparentLongitudeString).toEqual("279°51'30\"")

      expect(body.position.aberration).toEqual({"dDec": 1.543790024784711, "dRA": 1.506044160265716})
      expect(body.position.altaz.dLocalApparentSiderialTime).toEqual(0.5037761337802859)

      expect(body.position.apparent.dDec).toEqual(-0.40266799895209826)
      expect(body.position.apparent.dRA).toEqual(4.899579517039573)

      expect(body.position.equinoxEclipticLonLat["1"]).toEqual(0.000004016332594980136)
      expect(body.position.equinoxEclipticLonLat["2"]).toEqual(0.9833318985267808)
      expect(body.position.equinoxEclipticLonLat["3"]).toEqual({"degree": 279, "minutes": 52, "seconds": 5.2109247263433645})
      expect(body.position.equinoxEclipticLonLat["4"]).toEqual({"degree": 0, "minutes": 0, "seconds": 0.8284280645274755})

      expect(body.position.altaz.transit.UTdate).toEqual(0.6987754419144846);
      expect(body.position.altaz.transit.dApproxRiseUT).toEqual(3.1819716937961133);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(5.599667168395834);

      expect(body.position.altaz.atmosphericRefraction).toEqual({"dDec": -3.434999055980598e-11, "dRA": 0, "deg": 0})
      expect(body.position.altaz.diurnalAberation).toEqual({"dDec": -0.08931878508841723, "dRA": -0.005410752130287809, "dec": -0.40266843198178814, "ra": 4.899579123558574})
      expect(body.position.altaz.topocentric).toEqual({"altitude": -28.292954029774886, "azimuth": 263.16585592925907, "dDec": {"degree": 23, "minutes": 4, "seconds": 20.915465026334914}, "dRA": {"hours": 18, "milliseconds": 586, "minutes": 42, "seconds": 53}, "dec": -0.40269068182927403, "ra": -1.3836398418471454})
      expect(body.position.lightTime).toEqual(8.178122476657716)

      expect(body.position.constellation).toEqual("Sgr Sagittarii");

    })
  })

  describe('Moon', () => {
    let ephemeris, body
    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'moon'})
      body = ephemeris.moon
    })

    test('calculates position', () => {
      expect(body.position.apparentLongitudeString).toEqual("217°17'3\"")
      expect(body.position.apparentLongitude).toEqual(217.28435008107076)

      expect(body.position.Semidiameter.seconds).toEqual(54.08744547118285)

      expect(body.position.nutation.dRA).toEqual(-0.8377353595241296);
    	expect(body.position.nutation.dDec).toEqual(7.884225007355425);

    	expect(body.position.geometric.longitude).toEqual(-142.71159465087155);
    	expect(body.position.geometric.latitude).toEqual(5.23132586086829);
    	expect(body.position.geometric.distance).toEqual(0.15355593511588272);

    	expect(body.position.apparentGeocentric.longitude).toEqual(3.7923273219706926);
    	expect(body.position.apparentGeocentric.latitude).toEqual(0.09130386051687844);
    	expect(body.position.apparentGeocentric.distance).toEqual(62.86016884434851);

    	expect(body.position.dHorizontalParallax).toEqual(0.015908996146907033);

    	expect(body.position.sunElongation).toEqual(62.70937512973823);
    	expect(body.position.illuminatedFraction).toEqual(0.2718262029195282);

    	expect(body.position.apparent.dRA).toEqual(3.7814473341623236);
    	expect(body.position.apparent.dDec).toEqual(-0.15693166256853608);

      expect(body.position.altaz.transit.UTdate).toEqual(0.5064727340111443);
    	expect(body.position.altaz.transit.dApproxRiseUT).toEqual(1.6649300072171158);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(4.670279494052207);

    	expect(body.position.altaz.diurnalAberation.ra).toEqual(3.781446167769749);
    	expect(body.position.altaz.diurnalAberation.dec).toEqual(-0.15693168722230524);

    	expect(body.position.altaz.diurnalParallax.ra).toEqual( 3.779823523994774);
    	expect(body.position.altaz.diurnalParallax.dec).toEqual(-0.1652988947491685);

    	expect(body.position.altaz.atmosphericRefraction.deg).toEqual(0);
    	expect(body.position.altaz.atmosphericRefraction.dRA).toEqual(0);
    	expect(body.position.altaz.atmosphericRefraction.dDec).toEqual(-5.7249984266343304e-11);

    	expect(body.position.altaz.topocentric.altitude).toEqual(-57.38373112405539);
    	expect(body.position.altaz.topocentric.ra).toEqual(-2.503361783184812);
    	expect(body.position.altaz.topocentric.dec).toEqual(-0.16529889474916878);
    	expect(body.position.altaz.topocentric.azimuth).toEqual(345.8000378405458);
    })
  })

  describe('Mercury', () => {
    let ephemeris, body
    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'mercury'})
      body = ephemeris.mercury
    })

    test('calculates position', () => {
      expect(body.aberration.dDec).toEqual(2.642824379820767);
      expect(body.aberration.dRA).toEqual(-1.8347798396792003);
      expect(body.lightTime).toEqual(11.752301624521882);

      expect(body.position.aberration.dDec).toEqual(-0.12287505599556225);
      expect(body.position.aberration.dRA).toEqual(-1.5075211750286641);

      expect(body.position.altaz.atmosphericRefraction.deg).toEqual(0);
      expect(body.position.altaz.atmosphericRefraction.dRA).toEqual(0);
      expect(body.position.altaz.atmosphericRefraction.dDec).toEqual( -3.434999055980598e-11);

      expect(body.position.altaz.diurnalAberation.dec).toEqual(-0.42548719206700514);
      expect(body.position.altaz.diurnalAberation.ra).toEqual(4.733667904366067);

      expect(body.position.altaz.diurnalParallax.dec).toEqual(-0.42550091675960783);
      expect(body.position.altaz.diurnalParallax.ra).toEqual( 4.733645851268264);

      expect(body.position.altaz.transit.UTdate).toEqual(0.6718137988000532);
      expect(body.position.altaz.transit.dApproxRiseUT).toEqual(3.0418932246665533);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(5.399718264396107);


      expect(body.position.altaz.topocentric.altitude).toEqual( -36.15583168793744);
      expect(body.position.altaz.topocentric.ra).toEqual(-1.5495394559113222);
      expect(body.position.altaz.topocentric.dec).toEqual(-0.425500916759608);
      expect(body.position.altaz.topocentric.azimuth).toEqual(267.8392256448956);

      expect(body.position.apparent.dRA).toEqual(4.733668496715409);
      expect(body.position.apparent.dDec).toEqual(-0.42548676689441006);

      expect(body.position.apparentLongitudeString).toEqual("271°6'38\"")
      expect(body.position.apparentLongitude).toEqual(271.1106541946031)

    	expect(body.position.deflection.lightDeflection.dDec).toEqual(-0.0019398970516879548);
    	expect(body.position.deflection.sunElongation).toEqual(8.79845678423601);

      expect(body.position.nutation.dRA).toEqual(-1.022630262554928);
      expect(body.position.nutation.dDec).toEqual(5.64467600751711);

    	expect(body.position.apparentGeocentric["0"]).toEqual(4.7317735529316);
    	expect(body.position.apparentGeocentric["1"]).toEqual(-0.016476200621924616);
    	expect(body.position.apparentGeocentric["2"]).toEqual(1.413088769647956);
      expect(body.position.apparentGeocentric["3"]).toEqual({"degree": 271, "minutes": 6, "seconds": 38.35510057121155});
      expect(body.position.apparentGeocentric["4"]).toEqual({"degree": 0, "minutes": 56, "seconds": 38.46032896956956});

    	expect(body.position.trueGeocentricDistance).toEqual(1.4131504500560161);


      expect(body.position.constellation).toEqual("Sgr Sagittarii");
    })
  })

  describe('Venus', () => {
    let ephemeris, body
    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'venus'})
      body = ephemeris.venus
    })

    test('calculates position', () => {
      expect(body.aberration.dDec).toEqual(3.594110309815848);
      expect(body.aberration.dRA).toEqual(-0.8276189755227943);
      expect(body.lightTime).toEqual(9.433926903810674);

      expect(body.position.aberration.dDec).toEqual(2.8313821749630805);
      expect(body.position.aberration.dRA).toEqual(-1.121505535428317);

      expect(body.position.altaz.atmosphericRefraction.dDec).toEqual(-1.144999685326866e-11);
      expect(body.position.altaz.atmosphericRefraction.dRA).toEqual(0);
      expect(body.position.altaz.atmosphericRefraction.deg).toEqual(0);

      expect(body.position.altaz.dLocalApparentSiderialTime).toEqual(0.5037761337802859);

      expect(body.position.altaz.diurnalAberation.dDec).toEqual(-0.038144526243630135);
      expect(body.position.altaz.diurnalAberation.dRA).toEqual(-0.014526102566048108);
      expect(body.position.altaz.diurnalAberation.dec).toEqual(-0.3196297386617569);
      expect(body.position.altaz.diurnalAberation.ra).toEqual(4.176072814835088);

      expect(body.position.altaz.diurnalParallax.dDec).toEqual(-3.259823145373955);
      expect(body.position.altaz.diurnalParallax.dRA).toEqual(-0.2070947818475511);
      expect(body.position.altaz.diurnalParallax.dec).toEqual(-0.31964554277168056);
      expect(body.position.altaz.diurnalParallax.ra).toEqual(4.176057754864036);

      expect(body.position.altaz.topocentric.altitude).toEqual(-55.299014680469256);
      expect(body.position.altaz.topocentric.azimuth).toEqual(302.43376070230744);
      expect(body.position.altaz.topocentric.dec).toEqual(-0.3196455427716806);
      expect(body.position.altaz.topocentric.ra).toEqual(-2.1071275523155504);

      expect(body.position.altaz.transit.UTdate).toEqual(0.5834319427029031);
      expect(body.position.altaz.transit.dApproxRiseUT).toEqual(2.3723880068357643);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(4.957238118848688);

      expect(body.position.apparent.dDec).toEqual(-0.3196295537318751);
      expect(body.position.apparent.dRA).toEqual(4.1760738712030765);

      expect(body.position.apparentGeocentric["0"]).toEqual(4.205554049500989);
      expect(body.position.apparentGeocentric["1"]).toEqual(0.03633146982690926);
      expect(body.position.apparentGeocentric["2"]).toEqual(1.1343290137159499);

      expect(body.position.apparentLongitude).toEqual(240.96049755055918)
      expect(body.position.apparentLongitudeString).toEqual("240°57'37\"")

      expect(body.position.deflection.lightDeflection.dDec).toEqual(0.0008884081254434023);
      expect(body.position.deflection.lightDeflection.dRA).toEqual(-0.0002446192007537678);
      expect(body.position.deflection.sunElongation).toEqual(38.94597961424695);

    	expect(body.position.nutation.dDec).toEqual(7.784541116071769);
      expect(body.position.nutation.dRA).toEqual(-0.891697989354482);

    	expect(body.position.trueGeocentricDistance).toEqual(1.1344435584979051);

      expect(body.position.constellation).toEqual("Lib Librae");
    })
  })

  describe('Chiron', () => {
    let ephemeris, body
    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'chiron'})
      body = ephemeris.chiron
    })

    test('calculates position', () => {
      expect(ephemeris.Earth.position.date.julian).toEqual(2451544.5);
      expect(ephemeris.Date.julian).toEqual(2451544.5);

      expect(body.semiAxis).toEqual(13.670338374188397);
      expect(body.aberration.dDec).toEqual(0.26671942000413534);
      expect(body.aberration.dRA).toEqual(-0.491483989794519);
      expect(body.lightTime).toEqual(89.13459885508988);

      expect(body.position.aberration.dDec).toEqual(1.7046862193912549);
      expect(body.position.aberration.dRA).toEqual(-1.2861470394908976);

      expect(body.position.apparentLongitudeString).toEqual("251°51'51\"")
      expect(body.position.apparentLongitude).toEqual(251.86429073277426)

      expect(body.position.nutation.dRA).toEqual(-0.924912884492014);
    	expect(body.position.nutation.dDec).toEqual(7.2571378948853);

    	expect(body.position.deflection.lightDeflection.dDec).toEqual(0.0038973566292776498);
    	expect(body.position.deflection.sunElongation).toEqual(28.267479095836578);

      expect(body.position.apparent.dRA).toEqual(4.379524555482005);
      expect(body.position.apparent.dDec).toEqual(-0.316940973259521);
    	expect(body.position.apparentGeocentric["0"]).toEqual(4.395861141487153);
    	expect(body.position.apparentGeocentric["1"]).toEqual(0.0713353506914871);
    	expect(body.position.apparentGeocentric["2"]).toEqual(10.717484191787275);
      expect(body.position.apparentGeocentric["3"]).toEqual({"degree": 251, "minutes": 51, "seconds": 51.44663798735337});
      expect(body.position.apparentGeocentric["4"]).toEqual({"degree": 4, "minutes": 5, "seconds": 13.972288948256661});

    	expect(body.position.trueGeocentricDistance).toEqual(10.717603798330382);


      expect(body.position.altaz.transit.UTdate).toEqual(0.617025091134498);
    	expect(body.position.altaz.transit.dApproxRiseUT).toEqual(2.5876794066755537);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(5.166021987804478);

    	expect(body.position.altaz.diurnalAberation.ra).toEqual(4.379523646966461);
    	expect(body.position.altaz.diurnalAberation.dec).toEqual(-0.31694121605497977);

    	expect(body.position.altaz.diurnalParallax.ra).toEqual(4.379521538953043);
    	expect(body.position.altaz.diurnalParallax.dec).toEqual(-0.31694300944754744);

    	expect(body.position.altaz.atmosphericRefraction.deg).toEqual(0);
    	expect(body.position.altaz.atmosphericRefraction.dRA).toEqual(0);
    	expect(body.position.altaz.atmosphericRefraction.dDec).toEqual(-5.7249984266343304e-11);

    	expect(body.position.altaz.topocentric.altitude).toEqual(-47.33874448070378);
    	expect(body.position.altaz.topocentric.ra).toEqual(-1.9036637682265436);
    	expect(body.position.altaz.topocentric.dec).toEqual(-0.3169430094475477);
    	expect(body.position.altaz.topocentric.azimuth).toEqual(290.0506106380276);

      expect(body.position.constellation).toEqual("Oph Ophiuchi");
    })
  })

  describe('Sirius', () => {
    let ephemeris, body
    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'sirius'})
      body = ephemeris.sirius
    })

    test('calculates position', () => {

      expect(body.position.apparentLongitudeString).toEqual("101°17'23\"")
      expect(body.position.apparentLongitude).toEqual(1.767843531323971)

    	expect(body.position.deflection.lightDeflection.dDec).toEqual(0.0014984308353008266);
    	expect(body.position.deflection.sunElongation).toEqual(140.20814378464434);

    	expect(body.position.apparent.dRA).toEqual(1.767843531323971);
    	expect(body.position.apparent.dDec).toEqual(-0.29177988334236765);

      expect(body.position.altaz.transit.UTdate).toEqual(1.1998945488600037);
    	expect(body.position.altaz.transit.dApproxRiseUT).toEqual(6.225421628040243);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(8.852897971083864);

    	expect(body.position.altaz.diurnalAberation.ra).toEqual(1.767843897919368);
    	expect(body.position.altaz.diurnalAberation.dec).toEqual(-0.2917795644637801);

    	expect(body.position.altaz.diurnalParallax.ra).toEqual(1.767843897919368);
    	expect(body.position.altaz.diurnalParallax.dec).toEqual(-0.2917795644637801);

    	expect(body.position.altaz.atmosphericRefraction.deg).toEqual(0.3127048123159503);
    	expect(body.position.altaz.atmosphericRefraction.dRA).toEqual(-56.01842214360595);
    	expect(body.position.altaz.atmosphericRefraction.dDec).toEqual(786.7057329096253);

    	expect(body.position.altaz.topocentric.altitude).toEqual(1.8540808732683018);
    	expect(body.position.altaz.topocentric.ra).toEqual(-4.519415183877626);
    	expect(body.position.altaz.topocentric.dec).toEqual(-0.2879655074405612);
    	expect(body.position.altaz.topocentric.azimuth).toEqual(114.02566694455601);

      expect(body.position.astrimetricJ2000.dRA).toEqual(1.767791005321612);
      expect(body.position.astrimetricJ2000.dDec).toEqual(-0.291752264892662);

    })
  })


  describe('Single key ephemeris', () => {
    let ephemeris
    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'venus'})
    })

    test('returns a single result (venus)', () => {
      expect(ephemeris.Results.length).toEqual(1)
    })
  })

  describe('Multi key ephemeris', () => {
    let ephemeris
    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: ['sun', 'moon', 'VENUS', 'jupiter', 'neptune']})
    })

    test('returns a single result (venus, jupiter, neptune)', () => {
      expect(ephemeris.Results.length).toEqual(5)
    })
  })
})
