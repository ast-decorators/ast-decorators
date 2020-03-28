import {compare as _compare} from '../../../utils/testing';
import {accessor} from '../src';
import commonOptions from './fixtures/options';

const compare = async (
  fixture: string,
  options?: string | object,
): Promise<void> => _compare(__dirname, 'accessor', fixture, options);

describe('@ast-decorators/transform-accessor', () => {
  describe('@accessor', () => {
    it('compiles without interceptors', async () => {
      await compare('default', commonOptions);
    });

    it('compiles for static property', async () => {
      await compare('static-property', commonOptions);
    });

    it('preserves following decorators for both accessors', async () => {
      await compare('preserve-decorators-for-both', commonOptions);
    });

    it('preserves following decorators only for getter', async () => {
      await compare('preserve-decorators-for-single');
    });

    it('throws an error if transformer is not plugged in', () => {
      // @ts-ignore
      expect(() => accessor()()).toThrowError(
        "Decorator @accessor won't work because @ast-decorators/transform-accessor/lib/transformer" +
          'is not plugged in. You have to add it to your Babel config',
      );
    });
  });
});
