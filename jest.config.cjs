process.env.BABEL_ENV = 'cjs';

module.exports = {
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,js}'],
  coverageDirectory: '.coverage',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.{ts,js}'],
  testPathIgnorePatterns: ['<rootDir>/tests/fixtures/*'],
  transform: {
    '^.+\\.(js|ts)$': '<rootDir>/node_modules/babel-jest',
  },
};
