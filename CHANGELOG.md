# Changelog
<hr>

## **v1.0.0**

##### Fixed
- Fixed Moon `phaseQuarter` bug where integer did not align with expected moon phase start.

##### Added

- Added `phaseQuarterString` property to the `moon` result with a descriptor of the phase ("Full Moon", etc).
- Complete test coverage for all calculated bodies.

##### Changed
- Refactors much of the codebase into ES+ modules, classes, and OOP patterns where easy to do.

##### Breaking Changes

- Added Ephemeris class to access calculations (see `README` for usage examples)
- Requires month range 0 - 11 on instantiation
