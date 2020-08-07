import {transformFile as _transformFile} from '../../../utils/testing';
import {setter} from '../src';
import commonOptions from './fixtures/options';

const transformFile = async (
  fixture: string,
  options?: string | object,
): ReturnType<typeof _transformFile> =>
  _transformFile(__dirname, 'setter', fixture, options);

describe('@ast-decorators/transform-accessor', () => {
  describe('@setter', () => {
    it('compiles without interceptor', async () => {
      const {code} = await transformFile('default', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('compiles for private property', async () => {
      const {code} = await transformFile('private-property', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('compiles for property with assignment', async () => {
      const {code} = await transformFile('property-assigning', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('compiles for computed property', async () => {
      const {code} = await transformFile('computed-property', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('compiles for on static property', async () => {
      const {code} = await transformFile('static-property', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('uses class name instead of this for static property', async () => {
      const {code} = await transformFile('static-property-class-name');
      expect(code).toMatchSnapshot();
    });

    it('uses this for static property if class name is absent', async () => {
      const {code} = await transformFile('static-property-no-class-name');
      expect(code).toMatchSnapshot();
    });

    it('fails if applied to something else than property', async () => {
      await expect(
        transformFile('assert-property-type', commonOptions),
      ).rejects.toThrowError(
        'Applying @setter decorator to something other than property is not allowed',
      );
    });

    it('fails if interceptor is something else than function or identifier', async () => {
      await expect(
        transformFile('assert-interceptor-type', commonOptions),
      ).rejects.toThrowError(
        'Accessor interceptor can only be function, free variable or object property',
      );
    });

    it('fails if transformer is not plugged in', () => {
      // @ts-expect-error: Here the runtime replacement used. It does not
      // require arguments
      expect(() => setter()()).toThrowError(
        "Decorator @setter won't work because @ast-decorators/transform-accessor/lib/transformer" +
          'is not plugged in. You have to add it to your Babel config',
      );
    });

    describe('context', () => {
      it('omitted for inline arrow function interceptor', async () => {
        const {code} = await transformFile(
          'context-inline-arrow',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('added for inline regular function interceptor', async () => {
        const {code} = await transformFile(
          'context-inline-regular',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('omitted for in-file arrow function interceptor', async () => {
        const {code} = await transformFile(
          'context-within-arrow',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('added for in-file regular function interceptor (expression)', async () => {
        const {code} = await transformFile(
          'context-within-regular',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('added for in-file regular function interceptor (declaration)', async () => {
        const {code} = await transformFile(
          'context-within-declaration',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('added for imported interceptor by default', async () => {
        const {code} = await transformFile(
          'context-import-default',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('omitted for imported interceptor if "disableByDefault" is set', async () => {
        const {code} = await transformFile('context-import-disabled');
        expect(code).toMatchSnapshot();
      });

      it('omitted for imported interceptor if it fits "exclude" options', async () => {
        const {code} = await transformFile('context-import-ignored');
        expect(code).toMatchSnapshot();
      });

      it('added for imported interceptor if it fits "exclude" options and "disableByDefault" is set', async () => {
        const {code} = await transformFile('context-import-disabled-ignored');
        expect(code).toMatchSnapshot();
      });

      it('fails if in-file interceptor is not a function', async () => {
        await expect(
          transformFile('context-error-not-function', commonOptions),
        ).rejects.toThrowError('set is not a function');
      });

      it('fails if interceptor is not defined', async () => {
        await expect(
          transformFile('context-error-not-defined', commonOptions),
        ).rejects.toThrowError('set is not defined');
      });
    });
  });
});
