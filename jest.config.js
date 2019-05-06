module.exports = {
  moduleFileExtensions: ['js', 'json'],
  transformIgnorePatterns: ['node_modules(?![\\/](luxon)[\\/]).+\\.js$'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['*.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100
    }
  }
};
