import {transformFile as _transformFile} from '../../../utils/testing';
import {tracked} from '../src';
import commonOptions from './fixtures/options';

const transformFile = async (
  fixture: string,
  options?: string | object,
): ReturnType<typeof _transformFile> =>
  _transformFile(__dirname, 'tracked', fixture, options);

describe('@ast-decorators/transform-accessor', () => {
  describe('@tracked', () => {
    describe('class-related transformations', () => {
      it('compiles without interceptor', async () => {
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
    });

    describe('interceptor-related transformations', () => {
      it('compiles for the arrow function interceptor', async () => {
        const {code} = await transformFile(
          'interceptor-inline-arrow',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('compiles for the regular function interceptor', async () => {
        const {code} = await transformFile(
          'interceptor-inline-regular',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('compiles for imported interceptor', async () => {
        const {code} = await transformFile(
          'interceptor-import-default',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('compiles for imported namespace interceptor', async () => {
        const {code} = await transformFile(
          'interceptor-import-namespace',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });
    });

    describe('content-related transformations', () => {
      it('compiles for single decorator', async () => {
        const {code} = await transformFile(
          'content-single-decorator',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('compiles for existing setter', async () => {
        const {code} = await transformFile(
          'content-existing-setter',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('compiles for multiple decorators', async () => {
        const {code} = await transformFile(
          'content-multiple-decorators',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });
    });

    it('throws an error if transformer is not plugged in', () => {
      // @ts-expect-error: Here the runtime replacement used. It does not
      // require arguments
      expect(() => tracked()()).toThrowError(
        "Decorator @tracked won't work because @ast-decorators/transform-accessor/lib/transformer" +
          'is not plugged in. You have to add it to your Babel config',
      );
    });
  });
});
