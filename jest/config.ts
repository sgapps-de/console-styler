import type Jest from '@jest/types';

process.env = { ...process.env, TERM: 'test' };

const config: Jest.Config.InitialOptions = {
  moduleFileExtensions: ['js', 'ts'],
  rootDir: '../src',
  testRegex: './test/.*\\.test\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  collectCoverageFrom: ['**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageDirectory: '../.coverage',
  testEnvironment: 'node',
  verbose: true,
};

export default config;
