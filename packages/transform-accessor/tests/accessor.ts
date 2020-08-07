import {transformFile as _transformFile} from '../../../utils/testing';
import {accessor} from '../src';
import commonOptions from './fixtures/options';

const transformFile = async (
  fixture: string,
  options?: string | object,
): ReturnType<typeof _transformFile> =>
  _transformFile(__dirname, 'accessor', fixture, options);

describe('@ast-decorators/transform-accessor', () => {
  describe('@accessor', () => {
    it('compiles without interceptors', async () => {
      const {code} = await transformFile('default', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('compiles for static property', async () => {
      const {code} = await transformFile('static-property', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('preserves following decorators for both accessors', async () => {
      const {code} = await transformFile(
        'preserve-decorators-for-both',
        commonOptions,
      );
      expect(code).toMatchSnapshot();
    });

    it('preserves following decorators only for getter', async () => {
      const {code} = await transformFile('preserve-decorators-for-single');
      expect(code).toMatchSnapshot();
    });

    it('throws an error if transformer is not plugged in', () => {
      // @ts-expect-error: Here the runtime replacement used. It does not
      // require arguments
      expect(() => accessor()()).toThrowError(
        "Decorator @accessor won't work because @ast-decorators/transform-accessor/lib/transformer" +
          'is not plugged in. You have to add it to your Babel config',
      );
    });
  });
});
