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

### Notes on accuracy

- I've noticed that there are very tiny differences in the apparentLongitude decimal calculation of the bodies in the ES6 implementation vs the legacy implentation. I've tracked this down to a single variation in factors - `epsilon.js`.

I believe the differences are the result of a bug fix that is centered around the way `epsilon.js` handles its state. In the legacy implementation, `$moshier.epsilon` was a workhorse variable that was reassigned frequently in many calculations from many sources. This, I believe, resulted in the author losing track of what values `epsilon.js` would possess, because the results are not idempotent.

I've refactored the code to treat this as an immutable object generator, because I do not believe `epsilon` benefits from multiple iterations and mutations of its data. In fact, the original code had a check that seemed be failing and causing undesired mutations -

```
if (date.julian == this.jdeps) {
  return;
}
```

because in some instances, `date.julian` was passed in as a different value than what this.jdeps is. I've yet to track down why, but it seems irrelevant if we treat epsilon immutably. 
