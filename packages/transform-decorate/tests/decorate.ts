import {transformFile as _transformFile} from '../../../utils/testing';
import commonOptions from './fixtures/options';

const transformFile = async (
  fixture: string,
  options?: string | object,
): ReturnType<typeof _transformFile> =>
  _transformFile(__dirname, 'decorate', fixture, options);

describe('@ast-decorators/transform-decorate', () => {
  describe('@decorate', () => {
    describe('decorator types', () => {
      it('compiles for a method with inline arrow decorator', async () => {
        const {code} = await transformFile(
          'decorator-inline-arrow',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('compiles for a method with inline regular decorator', async () => {
        const {code} = await transformFile(
          'decorator-inline-regular',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('compiles for a method with decorator declared in the same file as an arrow function', async () => {
        const {code} = await transformFile(
          'decorator-within-arrow',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('compiles for a method with decorator declared in the same file as a regular function', async () => {
        const {code} = await transformFile(
          'decorator-within-regular',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('compiles for a method with decorator imported from an external file', async () => {
        const {code} = await transformFile(
          'decorator-import-default',
          commonOptions,
        );
        expect(code).toMatchSnapshot();
      });

      it('compiles for a method with multiple decorators', async () => {
        const {code} = await transformFile('decorator-multiple', commonOptions);
        expect(code).toMatchSnapshot();
      });

      it('sends arguments to a decorator function', async () => {
        const {code} = await transformFile('decorator-args', commonOptions);
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
          '@decorate can only be applied to class methods or properties with ' +
            'functions assigned',
        );
      });

      it('fails if property has incorrect value', async () => {
        await expect(
          transformFile('property-incorrect-value', commonOptions),
        ).rejects.toThrowError(
          '@decorate can only be applied to class methods or properties with ' +
            'functions assigned',
        );
      });
    });

    it('fails if there is no function provided for a @decorator', async () => {
      await expect(
        transformFile('failure-no-decorator', commonOptions),
      ).rejects.toThrowError(
        '@decorate: No decorator function provided for bar',
      );
    });

    it('fails if there is no function for a @decorator (and no method name)', async () => {
      await expect(
        transformFile('failure-no-decorator-no-name', commonOptions),
      ).rejects.toThrowError('@decorate: No decorator function provided');
    });
  });
});
