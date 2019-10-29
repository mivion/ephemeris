const ephemeris = require('./build/ephemeris-0.1.0.js')

var date = { year: 1986, month: 1, day: 1, hours: 1, minutes: 52, seconds: 0 };

$const.tlong = -71.10; // longitude
$const.glat = 42.37; // latitude

$processor.init();

var body = $moshier.body.sun; // + mercury, venus, moon, mars, jupiter, saturn, uranus, neptune, pluto, chiron, sirius

$processor.calc(date, body);

console.log(JSON.stringify(body.position, '', 2));