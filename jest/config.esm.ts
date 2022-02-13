import type Jest from '@jest/types';

const config: Jest.Config.InitialOptions = {
  moduleFileExtensions: ['js', 'ts'],
  rootDir: '../dist/node/esm',
  testRegex: './test/.*\\.test\\.js$',
  testEnvironment: 'node',
  verbose: true,
};

export default config;
