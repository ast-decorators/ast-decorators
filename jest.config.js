module.exports = {
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,js}'],
  coverageDirectory: '.coverage',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: ['<rootDir>/tests/**/*.{ts,js}'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/tests/fixtures/*'],
  transform: {
    '^.+\\.(js|ts)$': '<rootDir>/node_modules/babel-jest',
  },
};
