import {transformFileAsync} from '@babel/core';
import {resolve} from 'path';

const getOptions = (
  dir: string,
  type: string,
  fixture: string,
  file: string = 'options',
): object => {
  const optionsPath = resolve(dir, 'fixtures', type, fixture, file);

  // eslint-disable-next-line global-require
  const optionsOrModule = require(optionsPath);

  return {
    babelrc: false,
    configFile: false,
    ...(optionsOrModule.__esModule ? optionsOrModule.default : optionsOrModule),
  };
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
      : getOptions(dir, type, fixture, options);

  const fixtureDir = resolve(dir, 'fixtures', type, fixture);

  const {code: inputCode} =
    (await transformFileAsync(resolve(fixtureDir, 'input.ts'), finalOptions)) ??
    {};

  expect(inputCode).toMatchSnapshot();
};
