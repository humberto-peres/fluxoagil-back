module.exports = {
  testEnvironment: 'node',

  coverageDirectory: 'coverage',

  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/server.js',
    '!src/config/**',
  ],

  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  testTimeout: 5000,

  verbose: true,

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
};