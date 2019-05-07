export const copy = function(target /*, source ... */) {
  if (target) {
    for (let i = arguments.length - 1; i > 0; i--) {
      const source = arguments[i];
      if (source && source.hasOwnProperty) {
        for (const key in source) {
          if (source.hasOwnProperty(key)) {
            target[key] = source[key];
          }
        }
      }
    }
  }
  return target;
};

export const is = function(object, type) {
  const typeName = Object.prototype.toString.call(object).slice(8, -1);
  return object !== undefined && object !== null && type.name === typeName;
};

export const make = function(context, path) {
  if (is(context, String)) {
    path = context;
    context = document;
  }
  if (path) {
    const paths = path.split('.');
    const key = paths.shift();
    context[key] = context[key] || {};
    context = make(context[key], paths.join('.'));
  }
  return context;
};

export const define = function(context, path, object) {
  copy(make(context, path), object);
};
