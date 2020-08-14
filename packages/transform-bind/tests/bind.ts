import {transformFile as _transformFile} from '../../../utils/testing';
import {bind} from '../src';
import commonOptions from './fixtures/options';

const transformFile = async (
  fixture: string,
  options?: string | object,
): ReturnType<typeof _transformFile> =>
  _transformFile(__dirname, 'bind', fixture, options);

describe('@ast-decorators/transform-bind', () => {
  describe('@bind', () => {
    it('compiles for regular method', async () => {
      const {code} = await transformFile('method-default', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('compiles for private method', async () => {
      const {code} = await transformFile('method-private', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('compiles for private generator method', async () => {
      const {code} = await transformFile(
        'method-private-generator',
        commonOptions,
      );
      expect(code).toMatchSnapshot();
    });

    it('compiles for static method', async () => {
      const {code} = await transformFile('method-static', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('compiles for static generator method', async () => {
      const {code} = await transformFile(
        'method-static-generator',
        commonOptions,
      );
      expect(code).toMatchSnapshot();
    });

    it('compiles for private static method', async () => {
      const {code} = await transformFile(
        'method-private-static',
        commonOptions,
      );
      expect(code).toMatchSnapshot();
    });

    it('compiles for private static generator method', async () => {
      const {code} = await transformFile(
        'method-private-static-generator',
        commonOptions,
      );
      expect(code).toMatchSnapshot();
    });

    it('fails if decorator applied to something other than method', async () => {
      await expect(
        transformFile('failure-not-method', commonOptions),
      ).rejects.toThrowError(
        'Applying @bind decorator to something other than method is not allowed',
      );
    });

    it('fails if decorator applied to accessor', async () => {
      await expect(
        transformFile('failure-not-method-accessor', commonOptions),
      ).rejects.toThrowError(
        'Applying @bind decorator to something other than method is not allowed',
      );
    });

    it('fails if transformer is not plugged in', () => {
      // @ts-expect-error: Here the runtime replacement used. It does not
      // require arguments
      expect(() => bind()()).toThrowError(
        "Decorator @bind won't work because @ast-decorators/transform-bind/lib/transformer" +
          'is not plugged in. You have to add it to your Babel config',
      );
    });
  });
});
