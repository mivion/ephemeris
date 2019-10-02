# Moshier Ephemeris ES6 Re-implementation - The REBOOT!
**THIS IS A WORK IN PROGRESS**

This is a "re-implementation" of version 0.1.0 of Mivion's Moshier Ephemeris javascript implementation (found here: https://github.com/mivion/ephemeris).

The goal is to reimplement the codebase with ES6 modules and classes, idempotent & pure functions, and immutable data structures to promote better refactoring, debugging / testing, readability, and extensibility of the code.

This amazing work done by Moshier and Mivion deserves a lot of love and cleanup. Hope you enjoy and find it helpful in your project!

##  Description

ES6 re-implementation of ephemeris calculations for sun, planets, comets, asteroids and stars.

This implementation based on Steve Moshier (http://www.moshier.net).

Licensed under GPL version 2 (http://www.gnu.org/licenses/gpl-2.0.html).

## About Moshier's Ephemeris

First, what is an ephemeris? It's a table that gives you the position of various celestial bodies at every second of every minute of every day of every year.

Wow, that must be a gigantic table! Yes, and before computers, they were frequently sold in gigantic books every decade or so.

So what's Moshier's ephemeris? Well, it's a set of formula written by Stephen Moshier [(inventor of the human to dolphin translator!!)](http://www.moshier.net/catalogues/dolphins.html) that generates the apparent positions of celestial bodies, given a particular date/time/location, without all the tables!

The Jet Propulsion lab also has an ephemeris, which is only accessible via their website or a telnet connection. There's also the "Swiss Ephemeris", which is available for free until you hit a certain threshold.

But both of these popular ephemeris aren't as distributable as Moshier's. They're both essentially gigantic tables - dozens of MBs large compressed. Moshier's, with its tiny size, is built for the modern web! The only problem is that it was written in C...

But almost a decade ago, Mivion translated it into Javascript! And it's been around ever since, ready to be integrated into a project. The only issue is a lot has changed with Javascript over the past decade. I recently tried to implement it into a project and ran into an issue where my test runner couldn't parse its namespacing! That's when I decided: it's time to bring this gem into the future.


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

## Development process notes

It's essential at this stage to make sure that none of the results are different from what you get when running the legacy version with the same inputs (date, lat/lon, etc).

I'm running the legacy library in a bootstrapped frontend (repo https://github.com/0xStarcat/WesternHoroscopeJS) to ensure refactored values match.

Then tests are written.

**I am not an astronomer**. I don't fully understand how most of these formula work. That's why I'm not touching any of them until I have some tests written.

I'm also using the telnet interface that the Jet Propulsion laboratory provides here (https://ssd.jpl.nasa.gov/?horizons) to help verify my results.


### Notes on precision & accuracy upgrading from 0.1.0 to 1.0.0

I've noticed that there is very tiny differences (in the magnitude of 0.0000005 degrees) between the `apparentLongitude` decimal calculation of the `Sun` in the 1.0.0 implementation vs the 0.1.0 implentation. I've tracked this down to a specific calculation - `epsilon.js`.

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
$moshier.body.sun.position.constellation = $moshier.constellation.calc (ecr, // mutates $moshier.epsilon $moshier.body.earth.position.date);

$moshier.body.sun.position.apparent = $util.showrd (ecr, pol);

/* Show it in ecliptic coordinates */
y  =  $moshier.epsilon.coseps * rec[1]  +  $moshier.epsilon.sineps * rec[2]; // utilizes $moshier.epsilon
```

So in conclusion, this 0.0000005 variation in th Sun's `apparentLongitude` is a feature, not a bug.
