import {
  parseAsync,
  transformFileAsync,
  TransformOptions,
  transformAsync,
  BabelFileResult,
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

export const parseToAST = async (
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

export const transformFile = async (
  dir: string,
  type: string,
  fixture: string,
  options?: object | string,
): Promise<BabelFileResult> => {
  const finalOptions =
    typeof options === 'object'
      ? options
      : loadOptions(dir, type, fixture, options);

  const fixtureDir = resolve(dir, 'fixtures', type, fixture);

  return (
    (await transformFileAsync(
      resolve(fixtureDir, 'input.ts'),
      fixOptions(finalOptions),
    )) ?? {}
  );
};
