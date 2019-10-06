import Ephemeris from '../src/Ephemeris'

describe('Ephemeris', () => {
  const defaultOrigin = {
    year: 2000, month: 0, day: 1, hours: 0, minutes: 0, seconds: 0, longitude: -71.1, latitude: 41.37
  } // Jan 1st. 2000 0:00:00, Cambridge MA

  describe('constructor', () => {
    it('constructs a new class without error', () => {
      const ephemeris = new Ephemeris(defaultOrigin)
      expect(!!ephemeris).toEqual(true)
    })

    it('validates inputs', () => {
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

    it('assigns _bodyData', () => {
      const ephemeris = new Ephemeris(defaultOrigin)
      expect(ephemeris._bodyData.find(b => b.key === 'earth').anomaly).toEqual(1.1791)
      expect(ephemeris._bodyData.find(b => b.key === 'earth').ptable.distance).toEqual(1.000139872959708)
    })

    it('assigns Observer', () => {
      const ephemeris = new Ephemeris(defaultOrigin)
      expect(ephemeris.Observer.glat).toEqual(41.37)
      expect(ephemeris.Observer.tlong).toEqual(-71.1)
      expect(ephemeris.Observer.height).toEqual(0)
      expect(ephemeris.Observer.attemp).toEqual(12)
      expect(ephemeris.Observer.atpress).toEqual(1010)
      expect(ephemeris.Observer.tlat).toEqual(41.17920042308457)
      expect(ephemeris.Observer.trho).toEqual(0.9985423669162051)
    })

    it('calculates dates', () => {
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

    it('calculates Earth', () => {
      const ephemeris = new Ephemeris(defaultOrigin)
      expect(ephemeris.Earth.epoch).toEqual(2451544.5)
      expect(ephemeris.Earth.distance).toEqual(0.983316965107044)
      expect(ephemeris.Earth.position.polar).toEqual([1.7430277433487111, -0.00000401331969731571, 0.9833318985267808])
      expect(ephemeris.Earth.position.rect).toEqual([-0.16852457737110144, 0.8888429510893577, 0.38535606623087776])
    })

    it('calculates Results', () => {
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

    it('calculates position', () => {
      expect(body.position.aberration.dDec).toEqual(1.543790024784711)
      expect(body.position.aberration.dRA).toEqual(1.506044160265716)
      expect(body.position.lightTime).toEqual(8.178122476657716)

      expect(body.position.altaz.atmosphericRefraction.deg).toEqual(0);
      expect(body.position.altaz.atmosphericRefraction.dRA).toEqual(0);
      expect(body.position.altaz.atmosphericRefraction.dDec).toEqual(-3.434999055980598e-11);

      expect(body.position.altaz.dLocalApparentSiderialTime).toEqual(0.5037761337802859)

      expect(body.position.altaz.diurnalAberation.dec).toEqual(-0.40266843198178814);
      expect(body.position.altaz.diurnalAberation.ra).toEqual(4.899579123558574);

      expect(body.position.altaz.diurnalParallax.dec).toEqual(-0.40269068182927387);
      expect(body.position.altaz.diurnalParallax.ra).toEqual(4.899545465332441);

      expect(body.position.altaz.topocentric.altitude).toEqual(-28.292954029774886);
      expect(body.position.altaz.topocentric.azimuth).toEqual(263.16585592925907);
      expect(body.position.altaz.topocentric.dec).toEqual(-0.40269068182927403);
      expect(body.position.altaz.topocentric.ra).toEqual(-1.3836398418471454);

      expect(body.position.altaz.transit.UTdate).toEqual(0.6987754419144846);
      expect(body.position.altaz.transit.dApproxRiseUT).toEqual(3.1819716937961133);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(5.599667168395834);

      expect(body.position.apparent.dDec).toEqual(-0.40266799895209826)
      expect(body.position.apparent.dRA).toEqual(4.899579517039573)

      expect(body.position.apparentLongitude).toBeCloseTo(279.85845786893725, 6)
      expect(body.position.apparentLongitudeString).toEqual("279°51'30\"")

      expect(body.position.equinoxEclipticLonLat[0]).toEqual(4.884620063190782)
      expect(body.position.equinoxEclipticLonLat[1]).toEqual(0.000004016332594980136)
      expect(body.position.equinoxEclipticLonLat[2]).toEqual(0.9833318985267808)

      expect(body.position.constellation).toEqual("Sgr Sagittarii");

    })
  })

  describe('Moon', () => {
    it('calculates position', () => {
      const ephemeris = new Ephemeris({...defaultOrigin, key: 'moon'})
      const body = ephemeris.moon
      expect(body.position.Semidiameter.seconds).toEqual(54.08744547118285)

      expect(body.position.altaz.atmosphericRefraction.deg).toEqual(0);
      expect(body.position.altaz.atmosphericRefraction.dRA).toEqual(0);
      expect(body.position.altaz.atmosphericRefraction.dDec).toEqual(-5.7249984266343304e-11);

    	expect(body.position.altaz.diurnalAberation.ra).toEqual(3.781446167769749);
    	expect(body.position.altaz.diurnalAberation.dec).toEqual(-0.15693168722230524);

    	expect(body.position.altaz.diurnalParallax.ra).toEqual( 3.779823523994774);
    	expect(body.position.altaz.diurnalParallax.dec).toEqual(-0.1652988947491685);

    	expect(body.position.altaz.topocentric.altitude).toEqual(-57.38373112405539);
    	expect(body.position.altaz.topocentric.ra).toEqual(-2.503361783184812);
    	expect(body.position.altaz.topocentric.dec).toEqual(-0.16529889474916878);
    	expect(body.position.altaz.topocentric.azimuth).toEqual(345.8000378405458);

      expect(body.position.altaz.transit.UTdate).toEqual(0.5064727340111443);
      expect(body.position.altaz.transit.dApproxRiseUT).toEqual(1.6649300072171158);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(4.670279494052207);

      expect(body.position.apparent.dRA).toEqual(3.7814473341623236);
      expect(body.position.apparent.dDec).toEqual(-0.15693166256853608);

    	expect(body.position.apparentGeocentric.longitude).toEqual(3.7923273219706926);
    	expect(body.position.apparentGeocentric.latitude).toEqual(0.09130386051687844);
    	expect(body.position.apparentGeocentric.distance).toEqual(62.86016884434851);

      expect(body.position.apparentLongitudeString).toEqual("217°17'3\"")
      expect(body.position.apparentLongitude).toEqual(217.28435008107076)

    	expect(body.position.dHorizontalParallax).toEqual(0.015908996146907033);

      expect(body.position.geometric.longitude).toEqual(-142.71159465087155);
      expect(body.position.geometric.latitude).toEqual(5.23132586086829);
      expect(body.position.geometric.distance).toEqual(0.15355593511588272);

    	expect(body.position.illuminatedFraction).toEqual(0.2718262029195282);

      expect(body.position.nutation.dRA).toEqual(-0.8377353595241296);
    	expect(body.position.nutation.dDec).toEqual(7.884225007355425);

      expect(body.position.phaseDaysPast).toEqual(2.308172935055592);
      expect(body.position.phaseQuarter).toEqual(3);

      expect(body.position.sunElongation).toEqual(62.70937512973823);
    })

    it ('calculates moon phases', () => {
      let ephemeris = new Ephemeris({...defaultOrigin, day: 1, key: 'moon'})
      let body = ephemeris.moon

      expect(body.position.phaseQuarter).toEqual(3);
      expect(body.position.phaseQuarterString).toEqual("Last Quarter");
      expect(body.position.illuminatedFraction).toEqual(0.2718262029195282);
      expect(body.position.phaseDaysBefore).toEqual(undefined);
      expect(body.position.phaseDaysPast).toEqual(2.308172935055592);

      ephemeris = new Ephemeris({...defaultOrigin, day: 7, key: 'moon'})
      body = ephemeris.moon

      expect(body.position.phaseQuarter).toEqual(0);
      expect(body.position.phaseQuarterString).toEqual("New Moon");
      expect(body.position.illuminatedFraction).toBeCloseTo(0.0006617445257049992, 14);
      expect(body.position.phaseDaysBefore).toEqual(undefined);
      expect(body.position.phaseDaysPast).toBeCloseTo(0.22075147788362653, 14);

      ephemeris = new Ephemeris({...defaultOrigin, day: 15, key: 'moon'})
      body = ephemeris.moon

      expect(body.position.phaseQuarter).toEqual(1);
      expect(body.position.phaseQuarterString).toEqual("First Quarter");
      expect(body.position.illuminatedFraction).toEqual(0.5488689342271671);
      expect(body.position.phaseDaysBefore).toEqual(undefined);
      expect(body.position.phaseDaysPast).toEqual(0.4328134799840978);

      ephemeris = new Ephemeris({...defaultOrigin, day: 22, key: 'moon'})
      body = ephemeris.moon

      expect(body.position.phaseQuarter).toEqual(2);
      expect(body.position.phaseQuarterString).toEqual("Full Moon");
      expect(body.position.illuminatedFraction).toBeCloseTo(0.9906443297921943, 14);
      expect(body.position.phaseDaysBefore).toEqual(undefined);
      expect(body.position.phaseDaysPast).toBeCloseTo(0.8464007357321963, 14);

      ephemeris = new Ephemeris({...defaultOrigin, day: 29, key: 'moon'})
      body = ephemeris.moon

      expect(body.position.phaseQuarter).toEqual(3);
      expect(body.position.phaseQuarterString).toEqual("Last Quarter");
      expect(body.position.illuminatedFraction).toEqual(0.4367005906508668);
      expect(body.position.phaseDaysBefore).toEqual(undefined);
      expect(body.position.phaseDaysPast).toEqual(0.626845766795706);
    })
  })

  describe('Mercury', () => {
    let ephemeris, body
    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'mercury'})
      body = ephemeris.mercury
    })

    it('calculates position', () => {
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

      expect(body.position.altaz.topocentric.altitude).toEqual( -36.15583168793744);
      expect(body.position.altaz.topocentric.azimuth).toEqual(267.8392256448956);
      expect(body.position.altaz.topocentric.dec).toEqual(-0.425500916759608);
      expect(body.position.altaz.topocentric.ra).toEqual(-1.5495394559113222);

      expect(body.position.altaz.transit.UTdate).toEqual(0.6718137988000532);
      expect(body.position.altaz.transit.dApproxRiseUT).toEqual(3.0418932246665533);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(5.399718264396107);

      expect(body.position.apparent.dRA).toEqual(4.733668496715409);
      expect(body.position.apparent.dDec).toEqual(-0.42548676689441006);

      expect(body.position.apparentGeocentric["0"]).toEqual(4.7317735529316);
      expect(body.position.apparentGeocentric["1"]).toEqual(-0.016476200621924616);
      expect(body.position.apparentGeocentric["2"]).toEqual(1.413088769647956);

      expect(body.position.apparentLongitudeString).toEqual("271°6'38\"")
      expect(body.position.apparentLongitude).toEqual(271.1106541946031)

      expect(body.position.approxVisual.magnitude).toEqual(-1.2969473904757898)
      expect(body.position.approxVisual.phase).toEqual(0.9732692166925863)

    	expect(body.position.deflection.lightDeflection.dDec).toEqual(-0.0019398970516879548);
      expect(body.position.deflection.lightDeflection.dRA).toEqual(-0.0012248404327102546);
    	expect(body.position.deflection.sunElongation).toEqual(8.79845678423601);

      expect(body.position.nutation.dRA).toEqual(-1.022630262554928);
      expect(body.position.nutation.dDec).toEqual(5.64467600751711);

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

    it('calculates position', () => {
      expect(body.aberration.dDec).toEqual(3.594110309815848);
      expect(body.aberration.dRA).toEqual(-0.8276189755227943);
      expect(body.lightTime).toEqual(9.433926903810674);

      expect(body.position.aberration.dDec).toEqual(2.8313821749630805);
      expect(body.position.aberration.dRA).toEqual(-1.121505535428317);

      expect(body.position.altaz.atmosphericRefraction.dDec).toEqual(-1.144999685326866e-11);
      expect(body.position.altaz.atmosphericRefraction.dRA).toEqual(0);
      expect(body.position.altaz.atmosphericRefraction.deg).toEqual(0);

      expect(body.position.altaz.dLocalApparentSiderialTime).toEqual(0.5037761337802859);

      expect(body.position.altaz.diurnalAberation.dec).toEqual(-0.3196297386617569);
      expect(body.position.altaz.diurnalAberation.ra).toEqual(4.176072814835088);

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

      expect(body.position.approxVisual.magnitude).toEqual(-4.539990942872536)
      expect(body.position.approxVisual.phase).toEqual(0.756577504254073)

      expect(body.position.deflection.lightDeflection.dDec).toEqual(0.0008884081254434023);
      expect(body.position.deflection.lightDeflection.dRA).toEqual(-0.0002446192007537678);
      expect(body.position.deflection.sunElongation).toEqual(38.94597961424695);

    	expect(body.position.nutation.dDec).toEqual(7.784541116071769);
      expect(body.position.nutation.dRA).toEqual(-0.891697989354482);

    	expect(body.position.trueGeocentricDistance).toEqual(1.1344435584979051);

      expect(body.position.constellation).toEqual("Lib Librae");
    })
  })

  describe('Mars', () => {
    let ephemeris, body

    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'mars'})
      body = ephemeris.mars
    })

    it('calculates position', () => {
      expect(body.aberration.dDec).toEqual(-5.613032725581474);
      expect(body.aberration.dRA).toEqual(-1.0083599380745256);
      expect(body.lightTime).toEqual(15.360801317338371);

      expect(body.position.aberration.dDec).toEqual(-5.1125308469640744);
      expect(body.position.aberration.dRA).toEqual(-0.895359435444624);

      expect(body.position.altaz.atmosphericRefraction.dDec).toEqual(185.43015518491586);
      expect(body.position.altaz.atmosphericRefraction.dRA).toEqual(11.113812646918898);
      expect(body.position.altaz.atmosphericRefraction.deg).toEqual(0.06844013347126703);

      expect(body.position.altaz.dLocalApparentSiderialTime).toEqual(0.5037761337802859);

      expect(body.position.altaz.diurnalAberation.dec).toEqual(-0.23252287994469015);
      expect(body.position.altaz.diurnalAberation.ra).toEqual(5.762112019046082);

      expect(body.position.altaz.diurnalParallax.dec).toEqual(-0.2325397239360459);
      expect(body.position.altaz.diurnalParallax.ra).toEqual(5.762096781925065);

      expect(body.position.altaz.topocentric.altitude).toEqual(13.180252526298206);
      expect(body.position.altaz.topocentric.azimuth).toEqual(238.63869317796883);
      expect(body.position.altaz.topocentric.dec).toEqual(-0.2316407331748068);
      expect(body.position.altaz.topocentric.ra).toEqual(-0.5202803059914446);

      expect(body.position.altaz.transit.UTdate).toEqual(0.8362609583872772);
      expect(body.position.altaz.transit.dApproxRiseUT).toEqual(3.8825467289587525);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(6.628246551806736);

      expect(body.position.apparent.dDec).toEqual(-0.2325226509452756);
      expect(body.position.apparent.dRA).toEqual(5.762111398586604);

      expect(body.position.apparentGeocentric["0"]).toEqual(5.7172602011889175);
      expect(body.position.apparentGeocentric["1"]).toEqual(-0.018730222334798482);
      expect(body.position.apparentGeocentric["2"]).toEqual(1.8469723944910512);

      expect(body.position.apparentLongitude).toEqual(327.5748799062409)
      expect(body.position.apparentLongitudeString).toEqual("327°34'29\"")

      expect(body.position.approxVisual.magnitude).toEqual(0.6112629405510888)
      expect(body.position.approxVisual.phase).toEqual(0.9261415258921076)

      expect(body.position.deflection.lightDeflection.dDec).toEqual(0.001644991655373232);
      expect(body.position.deflection.lightDeflection.dRA).toEqual(0.00032345373087325555);
      expect(body.position.deflection.sunElongation).toEqual(47.72371385673165);

    	expect(body.position.nutation.dDec).toEqual(-1.934034621624479);
      expect(body.position.nutation.dRA).toEqual(-0.9740613725742825);

    	expect(body.position.trueGeocentricDistance).toEqual(1.8468922533582008);

      expect(body.position.constellation).toEqual("Aqr Aquarii");
    })
  })

  describe('Jupiter', () => {
    let ephemeris, body

    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'jupiter'})
      body = ephemeris.jupiter
    })

    it('calculates position', () => {
      expect(body.aberration.dDec).toEqual(-3.421325376823254);
      expect(body.aberration.dRA).toEqual(-0.5805249930804995);
      expect(body.lightTime).toEqual(38.368621424659786);

      expect(body.position.aberration.dDec).toEqual(1.5930068325002467);
      expect(body.position.aberration.dRA).toEqual(0.3571029156469145);

      expect(body.position.altaz.atmosphericRefraction.dDec).toEqual(37.298031389608326);
      expect(body.position.altaz.atmosphericRefraction.dRA).toEqual(0.30438023065611314);
      expect(body.position.altaz.atmosphericRefraction.deg).toEqual(0.010436180979367025);

      expect(body.position.altaz.dLocalApparentSiderialTime).toEqual(0.5037761337802859);

      expect(body.position.altaz.diurnalAberation.dec).toEqual(0.14982914445599954);
      expect(body.position.altaz.diurnalAberation.ra).toEqual(0.4162609083987987);

      expect(body.position.altaz.diurnalParallax.dec).toEqual(0.1498241693497983);
      expect(body.position.altaz.diurnalParallax.ra).toEqual(0.41626029444917795);

      expect(body.position.altaz.topocentric.altitude).toEqual(56.92545453363884);
      expect(body.position.altaz.topocentric.azimuth).toEqual(189.10949353673007);
      expect(body.position.altaz.topocentric.dec).toEqual(0.15000499530875966);
      expect(body.position.altaz.topocentric.ra).toEqual(0.41628242960419015);

      expect(body.position.altaz.transit.UTdate).toEqual(0.9853694372028002);
      expect(body.position.altaz.transit.dApproxRiseUT).toEqual(4.478269159767203);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(7.904413178909111);

      expect(body.position.apparent.dDec).toEqual(0.14982912928502926);
      expect(body.position.apparent.dRA).toEqual(0.41625973691559487);

      expect(body.position.apparentGeocentric["0"]).toEqual(0.4403991401909252);
      expect(body.position.apparentGeocentric["1"]).toEqual(-0.022086158489482532);
      expect(body.position.apparentGeocentric["2"]).toEqual(4.613417226062847);

      expect(body.position.apparentLongitude).toEqual(25.23301203413028)
      expect(body.position.apparentLongitudeString).toEqual("25°13'58\"")

      expect(body.position.approxVisual.magnitude).toEqual(-2.5901358180620053)
      expect(body.position.approxVisual.phase).toEqual(0.9907986122597068)

      expect(body.position.deflection.lightDeflection.dDec).toEqual(0.0009492218909910869);
      expect(body.position.deflection.lightDeflection.dRA).toEqual(0.00016092991151857682);
      expect(body.position.deflection.sunElongation).toEqual(105.36343467299977);

    	expect(body.position.nutation.dDec).toEqual(-7.395965718477901);
      expect(body.position.nutation.dRA).toEqual(-0.8211069441848226);

    	expect(body.position.trueGeocentricDistance).toEqual(4.613380444921528);

      expect(body.position.constellation).toEqual("Psc Piscium");
    })
  })

  describe('Saturn', () => {
    let ephemeris, body

    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'saturn'})
      body = ephemeris.saturn
    })

    it('calculates position', () => {
      expect(body.aberration.dDec).toEqual(-2.2046023855032524);
      expect(body.aberration.dRA).toEqual(-0.44266610542533197);
      expect(body.lightTime).toEqual(71.9033531619632);

      expect(body.position.aberration.dDec).toEqual(2.5554368247256605);
      expect(body.position.aberration.dRA).toEqual(0.7034135486615155);

      expect(body.position.altaz.atmosphericRefraction.dDec).toEqual(32.20472234277024);
      expect(body.position.altaz.atmosphericRefraction.dRA).toEqual(-0.5878299396192647);
      expect(body.position.altaz.atmosphericRefraction.deg).toEqual(0.0092595472814256);

      expect(body.position.altaz.dLocalApparentSiderialTime).toEqual(0.5037761337802859);

      expect(body.position.altaz.diurnalAberation.dec).toEqual(0.22018555238611068);
      expect(body.position.altaz.diurnalAberation.ra).toEqual(0.6767713825209708);

      expect(body.position.altaz.diurnalParallax.dec).toEqual(0.22018318585435928);
      expect(body.position.altaz.diurnalParallax.ra).toEqual(0.6767720362772485);

      expect(body.position.altaz.topocentric.altitude).toEqual(59.978662649379665);
      expect(body.position.altaz.topocentric.azimuth).toEqual(160.38813321294444);
      expect(body.position.altaz.topocentric.dec).toEqual(0.22033931875424037);
      expect(body.position.altaz.topocentric.ra).toEqual(-5.606456019101872);

      expect(body.position.altaz.transit.UTdate).toEqual(1.02671744816493);
      expect(body.position.altaz.transit.dApproxRiseUT).toEqual(4.673022605053817);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(8.229071180183011);

      expect(body.position.apparent.dDec).toEqual(0.22018559610259084);
      expect(body.position.apparent.dRA).toEqual(0.6767702087295415);

      expect(body.position.apparentGeocentric["0"]).toEqual(0.7052143083509064);
      expect(body.position.apparentGeocentric["1"]).toEqual(-0.04272965281338383);
      expect(body.position.apparentGeocentric["2"]).toEqual(8.645610834736935);

      expect(body.position.apparentLongitude).toEqual(40.40580352074438)
      expect(body.position.apparentLongitudeString).toEqual("40°24'20\"")

      expect(body.position.approxVisual.magnitude).toEqual(0.6215427269665463)
      expect(body.position.approxVisual.phase).toEqual(0.9978680488405215)

      expect(body.position.deflection.lightDeflection.dDec).toEqual(0.0007081670593766152);
      expect(body.position.deflection.lightDeflection.dRA).toEqual(0.00013642886295296523);
      expect(body.position.deflection.sunElongation).toEqual(120.50786093978951);

    	expect(body.position.nutation.dDec).toEqual(-7.927464122477248);
      expect(body.position.nutation.dRA).toEqual(-0.836335641892774);

    	expect(body.position.trueGeocentricDistance).toEqual(8.645573461612779);

      expect(body.position.constellation).toEqual("Ari Arietis");
    })
  })

  describe('Uranus', () => {
    let ephemeris, body

    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'uranus'})
      body = ephemeris.uranus
    })

    it('calculates position', () => {
      expect(body.aberration.dDec).toEqual(-1.2927914290168074);
      expect(body.aberration.dRA).toEqual(-0.30107280077581705);
      expect(body.lightTime).toEqual(172.34122018692491);

      expect(body.position.aberration.dDec).toEqual(-5.140969086232775);
      expect(body.position.aberration.dRA).toEqual(-1.1367005632491478);

      expect(body.position.altaz.atmosphericRefraction.dDec).toEqual(706.3877863171135);
      expect(body.position.altaz.atmosphericRefraction.dRA).toEqual(49.8275896755828);
      expect(body.position.altaz.atmosphericRefraction.deg).toEqual(0.2791964301206104);

      expect(body.position.altaz.dLocalApparentSiderialTime).toEqual(0.5037761337802859);

      expect(body.position.altaz.diurnalAberation.dec).toEqual(-0.2971915863964099);
      expect(body.position.altaz.diurnalAberation.ra).toEqual(5.540543833536314);

      expect(body.position.altaz.diurnalParallax.dec).toEqual(-0.2971930241129686);
      expect(body.position.altaz.diurnalParallax.ra).toEqual(5.540542300677519);

      expect(body.position.altaz.topocentric.altitude).toEqual(2.2939858985315684);
      expect(body.position.altaz.topocentric.azimuth).toEqual(245.07476025420857);
      expect(body.position.altaz.topocentric.dec).toEqual(-0.29376835948321645);
      expect(body.position.altaz.topocentric.ra).toEqual(-0.7390194419263522);

      expect(body.position.altaz.transit.UTdate).toEqual(0.8014019154514769);
      expect(body.position.altaz.transit.dApproxRiseUT).toEqual(3.7268853723682143);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(6.343936762109536);

      expect(body.position.apparent.dDec).toEqual(-0.2971912636424374);
      expect(body.position.apparent.dRA).toEqual(5.540543445934982);

      expect(body.position.apparentGeocentric["0"]).toEqual(5.494018234360817);
      expect(body.position.apparentGeocentric["1"]).toEqual(-0.011472362217222825);
      expect(body.position.apparentGeocentric["2"]).toEqual(20.722192440766474);

      expect(body.position.apparentLongitude).toEqual(314.7840573967912)
      expect(body.position.apparentLongitudeString).toEqual("314°47'2\"")

      expect(body.position.approxVisual.magnitude).toEqual(5.88943778092997)
      expect(body.position.approxVisual.phase).toEqual(0.9998003172836392)

      expect(body.position.deflection.lightDeflection.dDec).toEqual(0.003477265186288025);
      expect(body.position.deflection.lightDeflection.dRA).toEqual(0.0008399528222973481);
      expect(body.position.deflection.sunElongation).toEqual(34.929991128786504);

    	expect(body.position.nutation.dDec).toEqual(-0.18233380809813002);
      expect(body.position.nutation.dRA).toEqual(-1.014785007173613);

    	expect(body.position.trueGeocentricDistance).toEqual(20.72219134820217);

      expect(body.position.constellation).toEqual("Cap Capricorni");
    })
  })

  describe('Neptune', () => {
    let ephemeris, body

    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'neptune'})
      body = ephemeris.neptune
    })

    it('calculates position', () => {
      expect(body.aberration.dDec).toEqual(-0.7492494859050659);
      expect(body.aberration.dRA).toEqual(-0.2581126223572197);
      expect(body.lightTime).toEqual(257.9949213433013);

      expect(body.position.aberration.dDec).toEqual(-4.380534283782223);
      expect(body.position.aberration.dRA).toEqual(-1.315669009087547);

      expect(body.position.altaz.atmosphericRefraction.dDec).toEqual(-2.289999370653732e-11);
      expect(body.position.altaz.atmosphericRefraction.dRA).toEqual(0);
      expect(body.position.altaz.atmosphericRefraction.deg).toEqual(0);

      expect(body.position.altaz.dLocalApparentSiderialTime).toEqual(0.5037761337802859);

      expect(body.position.altaz.diurnalAberation.dec).toEqual(-0.335404436378095);
      expect(body.position.altaz.diurnalAberation.ra).toEqual(5.330488036767087);

      expect(body.position.altaz.diurnalParallax.dec).toEqual(-0.33540532841395515);
      expect(body.position.altaz.diurnalParallax.ra).toEqual(5.330486950019079);

      expect(body.position.altaz.topocentric.altitude).toEqual(-7.85729049512684);
      expect(body.position.altaz.topocentric.azimuth).toEqual(251.26315316589393);
      expect(body.position.altaz.topocentric.dec).toEqual(-0.33540532841395526);
      expect(body.position.altaz.topocentric.ra).toEqual(-0.9526983571605073);

      expect(body.position.altaz.transit.UTdate).toEqual(0.7680657753329643);
      expect(body.position.altaz.transit.dApproxRiseUT).toEqual(3.555907542727046);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(6.095949904986056);

      expect(body.position.apparent.dDec).toEqual(-0.33540405613713814);
      expect(body.position.apparent.dRA).toEqual(5.330487896293369);

      expect(body.position.apparentGeocentric["0"]).toEqual(5.291405467529599);
      expect(body.position.apparentGeocentric["1"]).toEqual(0.00412678863751077);
      expect(body.position.apparentGeocentric["2"]).toEqual(31.021135907402535);

      expect(body.position.apparentLongitude).toEqual(303.1752009818942)
      expect(body.position.apparentLongitudeString).toEqual("303°10'30\"")

      expect(body.position.approxVisual.magnitude).toEqual(7.982842388914111)
      expect(body.position.approxVisual.phase).toEqual(0.9999582520958422)

      expect(body.position.deflection.lightDeflection.dDec).toEqual(0.004659974811000858);
      expect(body.position.deflection.lightDeflection.dRA).toEqual(0.0013318885212761044);
      expect(body.position.deflection.sunElongation).toEqual(23.317379716584156);

    	expect(body.position.nutation.dDec).toEqual(1.4879772292532671);
      expect(body.position.nutation.dRA).toEqual(-1.0341342426832798);

    	expect(body.position.trueGeocentricDistance).toEqual(31.021122375248595);

      expect(body.position.constellation).toEqual("Cap Capricorni");
    })
  })

  describe('Pluto', () => {
    let ephemeris, body

    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'pluto'})
      body = ephemeris.pluto
    })

    it('calculates position', () => {
      expect(body.aberration.dDec).toEqual(1.4531163509068303);
      expect(body.aberration.dRA).toEqual(-0.2616999534608717);
      expect(body.lightTime).toEqual(258.38754870735244);

      expect(body.position.aberration.dDec).toEqual(0.511932460603443);
      expect(body.position.aberration.dRA).toEqual(-1.2521093541569577);

      expect(body.position.altaz.atmosphericRefraction.dDec).toEqual(-6.297498269297764e-11);
      expect(body.position.altaz.atmosphericRefraction.dRA).toEqual(0);
      expect(body.position.altaz.atmosphericRefraction.deg).toEqual(0);

      expect(body.position.altaz.dLocalApparentSiderialTime).toEqual(0.5037761337802859);

      expect(body.position.altaz.diurnalAberation.dec).toEqual(-0.19884201451989034);
      expect(body.position.altaz.diurnalAberation.ra).toEqual(4.387782922405951);

      expect(body.position.altaz.diurnalParallax.dec).toEqual(-0.1988427488557874);
      expect(body.position.altaz.diurnalParallax.ra).toEqual(4.387782211118012);

      expect(body.position.altaz.topocentric.altitude).toEqual(-42.26999705811246);
      expect(body.position.altaz.topocentric.azimuth).toEqual(296.41132135214366);
      expect(body.position.altaz.topocentric.dec).toEqual(-0.1988427488557877);
      expect(body.position.altaz.topocentric.ra).toEqual(-1.8954030960615746);

      expect(body.position.altaz.transit.UTdate).toEqual(0.6184256203576654);
      expect(body.position.altaz.transit.dApproxRiseUT).toEqual(2.4833228911915164);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(5.288020569168692);

      expect(body.position.apparent.dDec).toEqual(-0.19884185923051803);
      expect(body.position.apparent.dRA).toEqual(4.387783796429416);

      expect(body.position.apparentGeocentric["0"]).toEqual(4.388403103344769);
      expect(body.position.apparentGeocentric["1"]).toEqual(0.1894728725541749);
      expect(body.position.apparentGeocentric["2"]).toEqual(31.06834516805417);

      expect(body.position.apparentLongitude).toEqual(251.4369766237681)
      expect(body.position.apparentLongitudeString).toEqual("251°26'13\"")

      expect(body.position.approxVisual.magnitude).toEqual(13.863544867043124)
      expect(body.position.approxVisual.phase).toEqual(0.9999327837629342)

      expect(body.position.deflection.lightDeflection.dDec).toEqual(0.0066411994506396545);
      expect(body.position.deflection.lightDeflection.dRA).toEqual(-0.0009017297224181038);
      expect(body.position.deflection.sunElongation).toEqual(30.261949933648058);

    	expect(body.position.nutation.dDec).toEqual(7.229201000515858);
      expect(body.position.nutation.dRA).toEqual(-0.8974532581731016);

    	expect(body.position.trueGeocentricDistance).toEqual(31.068408221431163);

      expect(body.position.constellation).toEqual("Oph Ophiuchi");
    })
  })

  describe('Chiron', () => {
    let ephemeris, body

    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'chiron'})
      body = ephemeris.chiron
    })

    it('calculates position', () => {
      expect(ephemeris.Earth.date.julian).toEqual(2451544.5);
      expect(ephemeris.Date.julian).toEqual(2451544.5);

      expect(body.aberration.dDec).toEqual(0.26671942000413534);
      expect(body.aberration.dRA).toEqual(-0.491483989794519);
      expect(body.lightTime).toEqual(89.13459885508988);
      expect(body.semiAxis).toEqual(13.670338374188397);

      expect(body.position.aberration.dDec).toEqual(1.7046862193912549);
      expect(body.position.aberration.dRA).toEqual(-1.2861470394908976);

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

      expect(body.position.apparent.dRA).toEqual(4.379524555482005);
      expect(body.position.apparent.dDec).toEqual(-0.316940973259521);

      expect(body.position.apparentLongitudeString).toEqual("251°51'51\"")
      expect(body.position.apparentLongitude).toEqual(251.86429073277426)

      expect(body.position.apparentGeocentric["0"]).toEqual(4.395861141487153);
      expect(body.position.apparentGeocentric["1"]).toEqual(0.0713353506914871);
      expect(body.position.apparentGeocentric["2"]).toEqual(10.717484191787275);

      expect(body.position.approxVisual.magnitude).toEqual(16.621109386868966)
      expect(body.position.approxVisual.phase).toEqual(0.999442278101198)

    	expect(body.position.deflection.lightDeflection.dDec).toEqual(0.0038973566292776498);
    	expect(body.position.deflection.sunElongation).toEqual(28.267479095836578);

      expect(body.position.nutation.dRA).toEqual(-0.924912884492014);
      expect(body.position.nutation.dDec).toEqual(7.2571378948853);

    	expect(body.position.trueGeocentricDistance).toEqual(10.717603798330382);

      expect(body.position.constellation).toEqual("Oph Ophiuchi");
    })
  })

  describe('Sirius', () => {
    let ephemeris, body

    beforeAll(() => {
      ephemeris = new Ephemeris({...defaultOrigin, key: 'sirius'})
      body = ephemeris.sirius
    })

    it('calculates position', () => {
      expect(body.position.astrimetricJ2000.dRA).toEqual(1.767791005321612);
      expect(body.position.astrimetricJ2000.dDec).toEqual(-0.291752264892662);

      expect(body.position.apparent.dRA).toEqual(1.767843531323971);
      expect(body.position.apparent.dDec).toEqual(-0.29177988334236765);

      expect(body.position.apparentLongitude).toEqual(1.767843531323971)
      expect(body.position.apparentLongitudeString).toEqual("101°17'23\"")

      expect(body.position.altaz.transit.UTdate).toEqual(1.1998945488600037);
    	expect(body.position.altaz.transit.dApproxRiseUT).toEqual(6.225421628040243);
      expect(body.position.altaz.transit.dApproxSetUT).toEqual(8.852897971083864);

      expect(body.position.altaz.diurnalAberation.dec).toEqual(-0.2917795644637801);
    	expect(body.position.altaz.diurnalAberation.ra).toEqual(1.767843897919368);

      expect(body.position.altaz.diurnalParallax.dec).toEqual(-0.2917795644637801);
    	expect(body.position.altaz.diurnalParallax.ra).toEqual(1.767843897919368);

    	expect(body.position.altaz.atmosphericRefraction.dRA).toEqual(-56.01842214360595);
    	expect(body.position.altaz.atmosphericRefraction.dDec).toEqual(786.7057329096253);
      expect(body.position.altaz.atmosphericRefraction.deg).toEqual(0.3127048123159503);

    	expect(body.position.altaz.topocentric.altitude).toEqual(1.8540808732683018);
      expect(body.position.altaz.topocentric.azimuth).toEqual(114.02566694455601);
    	expect(body.position.altaz.topocentric.dec).toEqual(-0.2879655074405612);
      expect(body.position.altaz.topocentric.ra).toEqual(-4.519415183877626);

      expect(body.position.deflection.lightDeflection.dDec).toEqual(0.0014984308353008266);
      expect(body.position.deflection.sunElongation).toEqual(140.20814378464434);

    })
  })


  describe('Single key ephemeris', () => {
    it('returns a single result (venus)', () => {
      const ephemeris = new Ephemeris({...defaultOrigin, key: 'venus'})
      expect(ephemeris.Results.length).toEqual(1)
    })
  })

  describe('Multi key ephemeris', () => {
    it('returns a single result (sun, moon, venus, jupiter, neptune)', () => {
      const ephemeris = new Ephemeris({...defaultOrigin, key: ['sun', 'moon', 'VENUS', 'jupiter', 'neptune']})
      expect(ephemeris.Results.length).toEqual(5)
    })
  })
})
