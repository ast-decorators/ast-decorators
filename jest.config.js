module.exports = {
  collectCoverageFrom: ['<rootDir>/packages/*/src/**/*.{ts,js}'],
  coverageDirectory: '.coverage',
  moduleFileExtensions: ['js', 'json', 'ts', 'cjs'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/packages/*/tests/**/*.{ts,js}'],
  testPathIgnorePatterns: ['/fixtures/'],
  transform: {
    '^.+\\.(js|ts)$': '<rootDir>/node_modules/babel-jest',
  },
};
