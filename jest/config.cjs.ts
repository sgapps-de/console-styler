import type Jest from '@jest/types';

process.env = { ...process.env, TERM: 'test' };

const config: Jest.Config.InitialOptions = {
  moduleFileExtensions: ['js', 'ts'],
  rootDir: '../dist/node/cjs',
  testRegex: './test/.*\\.test\\.js$',
  testEnvironment: 'node',
  verbose: true,
};

export default config;
