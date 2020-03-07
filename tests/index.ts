/* eslint-disable global-require */
const {transformFileAsync} = require('@babel/core');
const {resolve} = require('path');

const getOptions = (fixture: string, type: string): object =>
  require(resolve(__dirname, 'fixtures', type, fixture, 'options.js'));

const compare = async (fixture: string, type: string): Promise<void> => {
  const options = getOptions(fixture, type);
  const fixtureDir = resolve(__dirname, 'fixtures', type, fixture);

  const {code: inputCode} = await transformFileAsync(
    resolve(fixtureDir, 'input.ts'),
    options,
  );

  expect(inputCode).toMatchSnapshot();
};

describe('AST Decorators', () => {
  describe('class', () => {
    it('compiles decorator for a class', async () => {
      await compare('default', 'class');
    });

    it('compiles multiple decorators for a class', async () => {
      await compare('multiple-decorators', 'class');
    });

    it('compiles decorators imported as namespace', async () => {
      await compare('namespace', 'class');
    });
  });

  describe('class-member', () => {
    it('compiles decorator for a public property', async () => {
      await compare('public-property', 'class-member');
    });

    it('compiles decorator for a private property', async () => {
      await compare('private-property', 'class-member');
    });

    it('compiles decorator for a public method', async () => {
      await compare('public-method', 'class-member');
    });

    it('compiles decorator for a private method', async () => {
      await compare('private-method', 'class-member');
    });

    it('compiles multiple decorators for a method', async () => {
      await compare('multiple-decorators', 'class-member');
    });

    it('compiles decorators imported as a namespace for a method', async () => {
      await compare('namespace', 'class-member');
    });
  });
});
