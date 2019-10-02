const path = require('path');

module.exports = {
  entry: {
    "ephemeris-1.0.0": './src/index.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build')
  }
};
