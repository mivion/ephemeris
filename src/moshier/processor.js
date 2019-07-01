import { calc as julianCalc, toGregorian } from './julian';
import { calc as deltaCalc } from './delta';
import { calc as keplerCalc, init as keplerInit } from './kepler';
import { calc as sunCalc } from './sun';
import { calc as moonCalc } from './moon';
import { calc as planetCalc } from './planet';
import { calc as starCalc } from './star';
import bodies, { init as bodyInit } from './body';
import variable from './variable';

export const calc = function(date, body) {
  variable.body = body;

  julianCalc(date);
  deltaCalc(date);

  date.universalDate = toGregorian({
    julian: date.universal
  });

  date.universalDateString =
    date.universalDate.day +
    '.' +
    date.universalDate.month +
    '.' +
    date.universalDate.year +
    ' ' +
    date.universalDate.hours +
    ':' +
    date.universalDate.minutes +
    ':' +
    (date.universalDate.seconds + date.universalDate.milliseconds / 1000);

  // First to calculate the Earth
  keplerCalc(date, bodies.earth);

  switch (body.key) {
    case 'sun':
      sunCalc();
      break;
    case 'moon':
      moonCalc();
      break;
    default:
      if (body.raMotion) {
        // star
        starCalc(body);
      } else {
        // planet
        planetCalc(body);
      }
      break;
  }
};

export const ecliptic = function(date, observer, body) {
  calc(date, observer);
  calc(date, body);
  //reduce(observer, body);
};

export const init = function() {
  bodyInit();
  keplerInit();
};
