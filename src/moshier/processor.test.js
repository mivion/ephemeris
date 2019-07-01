import { copy } from './common';
import { init, calc } from './processor';
import input from './input';
import bodies from './body';

describe('Ephemeris', () => {
  beforeAll(() => {
    // tested position
    copy(input, {
      tlong: -71.13,
      glat: 42.27,
      attemp: 12.0,
      atpress: 1010.0,
      height: 0.0
    });

    // initialize processor
    init();
  });

  // test the moon
  describe('Moon', () => {
    let body, date;

    beforeAll(() => {
      date = { year: 1986, month: 1, day: 1, hours: 1, minutes: 52, seconds: 0 };
      body = bodies.moon;
      calc(date, body);
    });

    test('Julian date', () => {
      expect(date.julian).toBeCloseTo(2446431.577777778, 9);
    });

    test('delta T', () => {
      expect(date.delta).toBeCloseTo(54.87009963821919, 14);
    });

    test('nutation RA', () => {
      expect(body.position.nutation.dRA).toBeCloseTo(-0.48342256851185134, 16);
    });
    test('nutation Dec', () => {
      expect(body.position.nutation.dDec).toBeCloseTo(5.886353197581648, 15);
    });

    test('geometric longitude', () => {
      expect(body.position.geometric.longitude).toBeCloseTo(156.0921880198016, 13);
    });
    test('geometric latitude', () => {
      expect(body.position.geometric.latitude).toBeCloseTo(4.422063993387057, 15);
    });
    test('geometric distance', () => {
      expect(body.position.geometric.distance).toBeCloseTo(0.14716616073282882, 16);
    });

    test('apparent geocentric longitude', () => {
      expect(body.position.apparentGeocentric.longitude).toBeCloseTo(2.7242742960376667, 16);
    });
    test('apparent geocentric latitude', () => {
      expect(body.position.apparentGeocentric.latitude).toBeCloseTo(0.07717957641849299, 17);
    });
    test('apparent geocentric distance', () => {
      expect(body.position.apparentGeocentric.distance).toBeCloseTo(60.24442952894567, 14);
    });

    test('horizontal parallax', () => {
      expect(body.position.dHorizontalParallax).toBeCloseTo(0.016599807399569004, 18);
    });

    test('Sun elongation', () => {
      expect(body.position.sunElongation).toBeCloseTo(124.15076164595345, 14);
    });

    test('illuminated fraction', () => {
      expect(body.position.illuminatedFraction).toBeCloseTo(0.7815787330095528, 16);
    });

    test('apparent RA', () => {
      expect(body.position.apparent.dRA).toBeCloseTo(2.7844808512258266, 16);
    });
    test('apparent Dec', () => {
      expect(body.position.apparent.dDec).toBeCloseTo(0.23362556081599462, 16);
    });

    // TODO: fix altaz?
    // test('diurnal aberation RA', () => {
    //   expect(body.position.altaz.diurnalAberation.ra).toBeCloseTo(2.7844805966970942, 16);
    // });
    // test('diurnal aberation Dec', () => {
    //   expect(body.position.altaz.diurnalAberation.dec).toBeCloseTo(0.23362530162522877, 16);
    // });

    // test('diurnal parallax RA', () => {
    //   expect(body.position.altaz.diurnalParallax.ra).toBeCloseTo(2.7967931740378766, 16);
    // });
    // test('diurnal parallax Dec', () => {
    //   expect(body.position.altaz.diurnalParallax.dec).toBeCloseTo(0.2221893682125501, 16);
    // });

    // test('atmospheric refraction degree', () => {
    //   expect(body.position.altaz.atmosphericRefraction.deg).toBeCloseTo(0.6356568799861307, 15);
    // });
    // test('atmospheric refraction RA', () => {
    //   expect(body.position.altaz.atmosphericRefraction.dRA).toBeCloseTo(-112.9014532718829, 13);
    // });
    // test('atmospheric refraction Dec', () => {
    //   expect(body.position.altaz.atmosphericRefraction.dDec).toBeCloseTo(1585.1382135790564, 13);
    // });

    // test('topocentric altitude', () => {
    //   expect(body.position.altaz.topocentric.altitude).toBeCloseTo(-0.2989379770846806, 14);
    // });
    // test('topocentric RA', () => {
    //   expect(body.position.altaz.topocentric.ra).toBeCloseTo(-3.4946025585162133, 16);
    // });
    // test('topocentric Dec', () => {
    //   expect(body.position.altaz.topocentric.dec).toBeCloseTo(0.22987433513647665, 16);
    // });
    // test('topocentric azimuth', () => {
    //   expect(body.position.altaz.topocentric.azimuth).toBeCloseTo(71.78002666681668, 14);
    // });
  });

  // test the sun
  describe('Sun', () => {
    let body, date;

    beforeAll(() => {
      date = { year: 1986, month: 1, day: 1, hours: 16, minutes: 47, seconds: 0 };
      body = bodies.sun;
      calc(date, body);
    });

    test('Julian date', () => {
      expect(date.julian).toBeCloseTo(2446432.199305556, 9);
    });

    test('delta T', () => {
      expect(date.delta).toBeCloseTo(54.87089572485891, 14);
    });

    test('equinox of date ecliptic longitude', () => {
      expect(body.position.equinoxEclipticLonLat[0]).toBeCloseTo(4.90413951369789, 14);
    });
    test('equinox of date ecliptic latitude', () => {
      expect(body.position.equinoxEclipticLonLat[1]).toBeCloseTo(0.000002184617423267333, 21);
    });
    test('equinox of date ecliptic distance', () => {
      expect(body.position.equinoxEclipticLonLat[2]).toBeCloseTo(0.9832794756330766, 16);
    });

    test('light time', () => {
      expect(body.position.lightTime).toBeCloseTo(8.177686171897745, 15);
    });

    test('aberration RA', () => {
      expect(body.position.aberration.dRA).toBeCloseTo(1.50327643199855, 14);
    });
    test('aberration Dec', () => {
      expect(body.position.aberration.dDec).toBeCloseTo(1.7448150469138453, 16);
    });

    test('constellation', () => {
      expect(body.position.constellation).toBe(77);
    });

    test('apparent RA', () => {
      expect(body.position.apparent.dRA).toBeCloseTo(4.920756988829355, 15);
    });
    test('apparent Dec', () => {
      expect(body.position.apparent.dDec).toBeCloseTo(-0.40123417213339135, 16);
    });

    test('apparent longitude', () => {
      expect(body.position.apparentLongitude).toBeCloseTo(280.9781321178379, 13);
    });

    // TODO: fix altaz?
    // test('diurnal parallax RA', () => {
    //   expect(body.position.altaz.diurnalParallax.ra).toBeCloseTo(4.920758543965699, 15);
    // });
    // test('diurnal parallax Dec', () => {
    //   expect(body.position.altaz.diurnalParallax.dec).toBeCloseTo(-0.4012734282906353, 16);
    // });

    // test('atmospheric refraction degree', () => {
    //   expect(body.position.altaz.atmosphericRefraction.deg).toBeCloseTo(0.0347669495824713, 16);
    // });
    // test('atmospheric refraction RA', () => {
    //   expect(body.position.altaz.atmosphericRefraction.dRA).toBeCloseTo(-0.0654871080210392, 16);
    // });
    // test('atmospheric refraction Dec', () => {
    //   expect(body.position.altaz.atmosphericRefraction.dDec).toBeCloseTo(125.15775095794257, 14);
    // });

    // test('topocentric altitude', () => {
    //   expect(body.position.altaz.topocentric.altitude).toBeCloseTo(24.771802544653966, 15);
    // });
    // test('topocentric RA', () => {
    //   expect(body.position.altaz.topocentric.ra).toBeCloseTo(-1.3624315255707726, 16);
    // });
    // test('topocentric Dec', () => {
    //   expect(body.position.altaz.topocentric.dec).toBeCloseTo(-0.4006666463910222, 16);
    // });
    // test('topocentric azimuth', () => {
    //   expect(body.position.altaz.topocentric.azimuth).toBeCloseTo(179.48488458374226, 14);
    // });
  });

  // test Sirius
  describe('Sirius', () => {
    let body, date;

    beforeAll(() => {
      date = { year: 1986, month: 1, day: 1, hours: 0, minutes: 0, seconds: 0 };
      body = bodies.sirius;
      calc(date, body);
    });

    test('julian date', () => {
      expect(date.julian).toBeCloseTo(2446431.5, 16);
    });

    test('delta T', () => {
      expect(date.delta).toBeCloseTo(54.87, 16);
    });

    test('apparent RA', () => {
      expect(body.position.apparent.dRA).toBeCloseTo(1.7651675096112047, 16);
    });
    test('apparent Dec', () => {
      expect(body.position.apparent.dDec).toBeCloseTo(-0.29137543179606207, 16);
    });

    test('astrimetric date RA', () => {
      expect(body.position.astrimetricDate.dRA).toBeCloseTo(1.7651002655957506, 16);
    });
    test('astrimetric date Dev', () => {
      expect(body.position.astrimetricDate.dDec).toBeCloseTo(-0.29140596467162816, 16);
    });

    // TODO: fix altaz?
    // test('topocentric altitude', () => {
    //   expect(body.position.altaz.topocentric.altitude).toBeCloseTo(1.7060953673767152, 16);
    // });
    // test('topocentric RA', () => {
    //   expect(body.position.altaz.topocentric.ra).toBeCloseTo(-4.522192086886859, 15);
    // });
    // test('topocentric Dec', () => {
    //   expect(body.position.altaz.topocentric.dec).toBeCloseTo(-0.2873401996237649, 16);
    // });
    // test('topocentric azimuth', () => {
    //   expect(body.position.altaz.topocentric.azimuth).toBeCloseTo(114.21923743994829, 14);
    // });
  });
});
