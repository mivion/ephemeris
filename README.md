**Note: Need any help to support this project. Contributors are welcome!**

Pure javascript implementation of ephemeris calculations for sun, planets, comets, asteroids and stars.

This implementation based on Steve Moshier (http://www.moshier.net).

Licensed under GPL version 2 (http://www.gnu.org/licenses/gpl-2.0.html).

Please contribute in this project.

### Example
``` 
<script type='text/javascript' src='ephemeris-0.1.0.js' charset='utf-8'></script>
<script type='text/javascript'>

var date = {year: 1986, month: 1, day: 1, hours: 1, minutes: 52, seconds: 0};

$const.tlong = -71.10; // longitude
$const.glat = 42.37; // latitude

$processor.init ();

// sun, mercury, venus, moon, mars, jupiter, saturn, uranus, neptune, pluto, chiron, sirius
var body = $moshier.body.sun;

$processor.calc (date, body);

console.log(body.position);
</script>
```
