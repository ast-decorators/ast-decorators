import {
  parseAsync,
  transformFileAsync,
  TransformOptions,
  transformAsync,
} from '@babel/core';
import {promises} from 'fs';
import {resolve} from 'path';

const {readFile} = promises;

const fixOptions = (options: TransformOptions): TransformOptions => ({
  babelrc: false,
  configFile: false,
  ...options,
});

const loadOptions = (
  dir: string,
  type: string,
  fixture: string,
  file: string = 'options',
): object => {
  const optionsPath = resolve(dir, 'fixtures', type, fixture, file);

  // eslint-disable-next-line global-require
  const optionsOrModule = require(optionsPath);

  return optionsOrModule.__esModule ? optionsOrModule.default : optionsOrModule;
};

export const compare = async (
  dir: string,
  type: string,
  fixture: string,
  options?: object | string,
): Promise<void> => {
  const finalOptions =
    typeof options === 'object'
      ? options
      : loadOptions(dir, type, fixture, options);

  const fixtureDir = resolve(dir, 'fixtures', type, fixture);

  const {code: inputCode} =
    (await transformFileAsync(
      resolve(fixtureDir, 'input.ts'),
      fixOptions(finalOptions),
    )) ?? {};

  expect(inputCode).toMatchSnapshot();
};

export const parse = async (
  dir: string,
  type: string,
  fixture: string,
  options?: object | string,
): ReturnType<typeof parseAsync> => {
  const finalOptions =
    typeof options === 'object'
      ? options
      : loadOptions(dir, type, fixture, options);

  const fixtureDir = resolve(dir, 'fixtures', type, fixture);
  const content = await readFile(resolve(fixtureDir, 'input.ts'), 'utf8');

  return parseAsync(content, fixOptions(finalOptions));
};

export const transform = async (
  dir: string,
  type: string,
  fixture: string,
  options?: object | string,
): ReturnType<typeof transformAsync> => {
  const finalOptions =
    typeof options === 'object'
      ? options
      : loadOptions(dir, type, fixture, options);

  const fixtureDir = resolve(dir, 'fixtures', type, fixture);
  const content = await readFile(resolve(fixtureDir, 'input.ts'), 'utf8');

  return transformAsync(content, fixOptions(finalOptions));
};
