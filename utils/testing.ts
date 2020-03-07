import {transformFileAsync} from '@babel/core';
import {resolve} from 'path';

const getOptions = (dir: string, fixture: string, type: string): object =>
  // eslint-disable-next-line global-require
  require(resolve(dir, 'fixtures', type, fixture, 'options'));

export const compare = async (
  dir: string,
  fixture: string,
  type: string,
): Promise<void> => {
  const options = getOptions(dir, fixture, type);
  const fixtureDir = resolve(dir, 'fixtures', type, fixture);

  const {code: inputCode} =
    (await transformFileAsync(resolve(fixtureDir, 'input.ts'), options)) ?? {};

  expect(inputCode).toMatchSnapshot();
};
