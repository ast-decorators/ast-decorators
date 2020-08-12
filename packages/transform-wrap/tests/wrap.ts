import {transformFile as _transformFile} from '../../../utils/testing';
import commonOptions from './fixtures/options';

const transformFile = async (
  fixture: string,
  options?: string | object,
): ReturnType<typeof _transformFile> =>
  _transformFile(__dirname, 'wrap', fixture, options);

describe('@ast-decorators/transform-wrap', () => {
  describe('@wrap', () => {
    describe('wrapper types', () => {
      it('compiles for a method with inline arrow wrapper', async () => {
        const {code} = await transformFile(
          'wrapper-inline-arrow',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('compiles for a method with inline regular wrapper', async () => {
        const {code} = await transformFile(
          'wrapper-inline-regular',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('compiles for a method with wrapper declared in the same file as an arrow function', async () => {
        const {code} = await transformFile(
          'wrapper-within-arrow',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('compiles for a method with wrapper declared in the same file as a regular function', async () => {
        const {code} = await transformFile(
          'wrapper-within-regular',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('compiles for a method with wrapper imported from an external file', async () => {
        const {code} = await transformFile(
          'wrapper-import-default',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('compiles for a method with multiple wrappers', async () => {
        const {code} = await transformFile('wrapper-multiple', commonOptions);
        expect(code).toMatchSnapshot();
      });

      it('sends arguments to a wrapper function', async () => {
        const {code} = await transformFile('wrapper-args', commonOptions);
        expect(code).toMatchSnapshot();
      });
    });

    describe('method', () => {
      it('compiles for a private method', async () => {
        const {code} = await transformFile('method-private', commonOptions);
        expect(code).toMatchSnapshot();
      });

      it('compiles for a generator method', async () => {
        const {code} = await transformFile('method-generator', commonOptions);
        expect(code).toMatchSnapshot();
      });

      it('compiles for a private generator method', async () => {
        const {code} = await transformFile(
          'method-private-generator',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });
    });

    describe('property', () => {
      it('compiles for a property defined as an arrow function', async () => {
        const {code} = await transformFile('property-arrow', commonOptions);
        expect(code).toMatchSnapshot();
      });

      it('compiles for a property defined as a regular function', async () => {
        const {code} = await transformFile('property-regular', commonOptions);
        expect(code).toMatchSnapshot();
      });

      it('compiles for a private property', async () => {
        const {code} = await transformFile('property-private', commonOptions);
        expect(code).toMatchSnapshot();
      });

      it('fails if property does not have value', async () => {
        await expect(
          transformFile('property-no-function', commonOptions),
        ).rejects.toThrowError(
          '@wrap can only be applied to class methods or properties with function assigned',
        );
      });

      it('fails if property has incorrect value', async () => {
        await expect(
          transformFile('property-incorrect-value', commonOptions),
        ).rejects.toThrowError(
          '@wrap can only be applied to class methods or properties with function assigned',
        );
      });
    });
  });
});
