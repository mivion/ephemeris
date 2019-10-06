#### **v1.0.0** 10/6/19

**Non-breaking changes**

- Refactors much of the codebase into ES+ modules, classes, and OOP styles where easy.
- Fixes Moon Phase `phaseQuarter` bug, and adds `phaseQuarterString` property to the moon result with a descriptor of the phase ("Full Moon", etc).

**Breaking Changes**

- Added Ephemeris class to access calculations (see README for usage examples)
- Requires month range 0 - 11 on instantiation
