# Moshier Ephemeris ES6 Re-implementation - The REBOOT!

This is a "re-implementation" of version 0.1.0 of Mivion's Moshier Ephemeris javascript implementation (found here: https://github.com/mivion/ephemeris).

The goal is to re-implement the codebase with ES6 modules and classes, introduce object oriented programming practices, implement idempotent & pure utility functions, and implement immutable data structures to promote better refactoring, debugging / testing, readability, and extensibility of the code.

This amazing work done by Moshier and Mivion deserves a lot of love and cleanup. Hope you enjoy and find it helpful in your project!

##  Description

ES6 re-implementation of ephemeris calculations for sun, planets, comets, asteroids and stars.

This implementation based on Steve Moshier (http://www.moshier.net).

Licensed under GPL version 3 (https://www.gnu.org/licenses/gpl-3.0.html).

## About Moshier's Ephemeris

First, what is an ephemeris? It's a table that gives you the position of various celestial bodies at every second of every minute of every day of every year.

Wow, that must be a gigantic table! Yes, and before computers, they were frequently sold in gigantic books every decade or so.

So what's Moshier's ephemeris? Well, it's a set of formula written by Stephen Moshier [(inventor of the human to dolphin translator!!)](http://www.moshier.net/catalogues/dolphins.html) that generates the apparent positions of celestial bodies, given a particular date/time/location, without all the tables!

The Jet Propulsion lab also has an ephemeris, which is only accessible via their website or a telnet connection. There's also the "Swiss Ephemeris", which is available for free until you hit a certain threshold.

But both of these popular ephemeris aren't as distributable as Moshier's. They're both essentially gigantic tables - dozens of MBs large compressed. Moshier's, with its tiny size, is built for the modern web!

The only problem is that it was written in C...

Thankfully, years ago, Mivion translated it into Javascript! The only issue is a lot has changed with Javascript over the past few years and I had difficulty integrating it into my projects. Well, that difficulty is now a thing of the past!

Moshier's Ephemeris is good from -3000 B.C.E - 3000 C.E. Its results are always within less than a degree of the other leading Ephemerii, making this a highly precise library.

## Celestial Bodies
- Sun
- Moon
- Earth
- Mercury
- Venus
- Mars
- Jupiter
- Saturn
- Uranus
- Neptune
- Pluto
- Chiron
- Sirius

## Demo

Open the file: `/demo/index.html` in your browser.

## Usage

##### Load the library
```
// in node

import Ephemeris from './build/ephemeris-1.0.0.bundle.js'


// or in a browser

new Mosher.default()
```

#####  Create a new ephemeris instance for all celestial bodies
```
# Create a new ephemeris instance

// January 1st, 2000, 0:00 UTC - Cambridge, MA

const ephemeris = new Ephemeris({
  year: 2000, month: 0, day: 1, hours: 0, minutes: 0, latitude: 41.37, longitude: -71.1
})
```

##### Generate ephemeris for a single body ( or multiple )
```
# a single body = with key: "string"

const ephemeris = new Ephemeris({
  key: "jupiter",
  year: 2000, month: 0, day: 1, hours: 0, minutes: 0, latitude: 41.37, longitude: -71.1
})

# multiple specific bodies with key: [array]

const ephemeris = new Ephemeris({
  key: ["jupiter", "venus", "moon", "chiron"],
  year: 2000, month: 0, day: 1, hours: 0, minutes: 0, latitude: 41.37, longitude: -71.1
})
```

##### View all results
```
# View all results

ephemeris.Results

// => Array[{sun}, {moon}, {mercury}...]
```

##### Get a specific celestial body from results

```
# View a specific celestial body result (if generated)

ephemeris.mercury

// => {
  aberration: {
    dRA: -1.9269831284660512, dDec: 1.7324642445063785
  },
  anomaly: 198.7199,
  dailyMotion : 4.09236,
  distance : 0.4662701071857169,
  eccentricity: 0.205628,
  epoch: 2458849.491717961,
  equinox: {
    julian: 2451545
  },
  equinoxEclipticLonLat: {
    0: 4.580688286536208, 1: -0.06840241722458161, 2: 0.46626601943095985, 3: {…}, 4: {…}
  },
  inclination: 7.0048,
  key: "mercury",
  lightTime: 11.926136235901744,
  longitude: 4.575414616860342,
  magnitude: -0.42,
  node: 48.177,
  perihelion: 29.074,
  position: {
    aberration: {
      dRA: -1.520496036316089, dDec: -0.6041546957957655
    }
    altaz: {
      atmosphericRefraction: {
        deg: 0, dRA: 0, dDec: -6.869998111961196e-11
      }
      dLocalApparentSiderialTime: 0.5064527239416776,
      diurnalAberation: {
        ra: 4.7965251351249245, dec: -0.4299743725608752, dRA: -0.007210078050044472, dDec: -0.09119535940094521
      },
      diurnalParallax: {
        ra: 4.796502712347188, dec: -0.42998832257864683, dRA: -0.3083384338139288, dDec: -2.877388508875992
      },
      localApparentSiderialTime: {hours: 1, minutes: 56, seconds: 4, milliseconds: 225},
      topocentric: {
        altitude: -33.71884921853349, azimuth: 265.4081776827269, ra: -1.4866825948323983, dec: -0.42998832257864716, dRA: {…}
      },
      transit: {
        approxLocalMeridian: {…}, UTdate: 0.6813053006006518, dApproxRiseUT: 3.1070972173980613, dApproxSetUT: 5.454150456008398, approxRiseUT: {…}
      }
    },
    apparent: {
      dRA: 4.796525659456597, dDec: -0.42997393043329624, ra: {…}, dec: {…}
    },
    apparentGeocentric: {
      0: 4.788870432436304, 1: -0.02220591955722075, 2: 1.4339905077136768, 3: {…}, 4: {…}},
    apparentLongitude: 274.38206441358966,
    apparentLongitude30String: "4°22'55"",
    apparentLongitudeString: "274°22'55"",
    approxVisual: {
      magnitude: -1.281820354968265, phase: 0.9886399799797707
    },
    astrometricB1950: {
      dRA: 4.777961264165778, dDec: -0.4304857584347518, ra: {…}, dec: {…}
    },
    astrometricJ2000: {
      dRA: 4.7913641878585755, dDec: -0.430134842061789, ra: {…}, dec: {…}
    },
    constellation: 77,
    date: {
      year: 2020, month: 1, day: 1, hours: 0, minutes: 0
    },
    deflection: {
      sunElongation: 5.768325480048136, lightDeflection: {…}
    },
    equatorialDiameter: 4.686223488825094,
    geocentricDistance: 1.4339905077136652,
    nutation: {
      dRA: -1.2125665235304237, dDec: 1.1499169000116969
    }
    polar: [4.575812495945637, -0.06835690545143856, 0.4662660194309599],
    rect: [-0.06351901141088291, -0.4101381667492277, -0.21250842858566044],
    trueGeocentricDistance: 1.4340239958103242
  }
}
```

##### Get the Earth and Observer
```
# Get the Earth and Observer

ephemeris.Earth

// => Object{earth}

ephemeris.Observer

// => Object{observer}
```

## Installation

```
npm install

// or yarn install
```

## Testing

```
npm test

// or yarn test
```

## Future work
- Retrograde & stationary planet determinations
- Moon phases classifications
- Add more comets & asteroids
- Refactoring as needed (I'm not looking to go overboard with this now as we're getting to the point of diminishing returns)

## Development process notes

It's essential at this stage to make sure that none of the results are different from what you get when running the legacy version with the same inputs (date, lat/lon, etc).

I'm running the legacy library in a bootstrapped frontend (repo https://github.com/0xStarcat/WesternHoroscopeJS) to ensure refactored values match.

Then tests are written.

**I am not an astronomer**. I don't fully understand how most of these formula work. That's why I'm not touching any of them until I have some tests written.

I'm also using the telnet interface that the Jet Propulsion laboratory provides here (https://ssd.jpl.nasa.gov/?horizons) to help verify my results.


### Notes on precision & accuracy upgrading from 0.1.0 to 1.0.0

1) There is very tiny differences (in the magnitude of 0.0000005 degrees) between the `apparentLongitude` decimal calculation of the `Sun` in the 1.0.0 implementation vs the 0.1.0 implentation. I've tracked this down to a specific calculation - `epsilon.js`.

I believe this upgrade actually fixed a bug in the original implementation. The bug was centered around the way `epsilon.js` was implemented. In the 0.1.0 implementation, `$moshier.epsilon` was a global variable that was reassigned frequently. This, I believe, resulted in unintentional mutations.

I refactored the code to treat this as an immutable locally scoped object, because I do not believe `epsilon` was intended to store global mutations of its data.

Legacy code (mutations noted):

`v0.1.0 Sun.js - line 76 - 87`
```
$moshier.epsilon.calc ($moshier.body.earth.position.date); // Sets $moshier.epsilon - now locally scoped & immutable in 1.0.0
$moshier.nutation.calc ($moshier.body.earth.position.date, ecr); // mutates $moshier.epsilon

/* Display the final apparent R.A. and Dec.
 * for equinox of date.
 */
$moshier.body.sun.position.constellation = $moshier.constellation.calc (ecr, $moshier.body.earth.position.date); // mutates $moshier.epsilon

$moshier.body.sun.position.apparent = $util.showrd (ecr, pol);

/* Show it in ecliptic coordinates */
y  =  $moshier.epsilon.coseps * rec[1]  +  $moshier.epsilon.sineps * rec[2]; // utilizes $moshier.epsilon
```

So in conclusion, this 0.0000005 difference in the Sun's `apparentLongitude` between versions 0.1.0 and 1.0.0 is a bugfix and a feature, not a bug.

Everything else appears to be exactly the same according to my tests.

2) Tiny correction (0.1*e-15 or 0.000000000000001) on moon `illuminatedFraction` and `phaseDaysPast / phaseDaysBefore` from gplan refactoring. Most likely due to the conversion differences between radians-to-seconds and seconds-to-radians constants (RTS and STR) in app. Possibly solution is using equations involving Math.PI instead.
