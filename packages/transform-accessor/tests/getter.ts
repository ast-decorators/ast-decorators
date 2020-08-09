import {transformFile as _transformFile} from '../../../utils/testing';
import {getter} from '../src';
import commonOptions from './fixtures/options';

const transformFile = async (
  fixture: string,
  options?: string | object,
): ReturnType<typeof _transformFile> =>
  _transformFile(__dirname, 'getter', fixture, options);

describe('@ast-decorators/transform-accessor', () => {
  describe('@getter', () => {
    describe('class-related transformations', () => {
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

      it('compiles for static property', async () => {
        const {code} = await transformFile('static-property', commonOptions);
        expect(code).toMatchSnapshot();
      });

      it('compiles for existing getter', async () => {
        const {code} = await transformFile('getter-method', commonOptions);
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

    describe('method content', () => {
      it('compiles for multiple decorators', async () => {
        const {code} = await transformFile(
          'content-multiple-decorators',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('does not create new this binding if it already exists', async () => {
        const {code} = await transformFile(
          'content-existing-this',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('uses existing variable for return', async () => {
        const {code} = await transformFile('content-return-var', commonOptions);
        expect(code).toMatchSnapshot();
      });
    });

    describe('errors', () => {
      it('fails if applied to something else than property', async () => {
        await expect(
          transformFile('assert-property-type', commonOptions),
        ).rejects.toThrowError(
          'Applying @getter decorator to something other than property or accessor is not allowed',
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
        expect(() => getter()()).toThrowError(
          "Decorator @getter won't work because @ast-decorators/transform-accessor/lib/transformer" +
            'is not plugged in. You have to add it to your Babel config',
        );
      });
    });
  });
});
