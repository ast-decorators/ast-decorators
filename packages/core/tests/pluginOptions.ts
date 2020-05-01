import {
  transform as _transform,
  transformFile as _transformFile,
} from '../../../utils/testing';
import createOptions from './fixtures/plugin-options/options';
import transformer from './fixtures/plugin-options/transformer';

const transform = async (
  fixture: string,
  options: string,
): ReturnType<typeof _transform> =>
  _transform(__dirname, 'plugin-options', fixture, options);

const transformFile = async (
  fixture: string,
  options?: string | object,
): ReturnType<typeof _transformFile> =>
  _transformFile(__dirname, 'plugin-options', fixture, options);

describe('@ast-decorators/core', () => {
  describe('plugin-options', () => {
    it('compiles in one way if option has one state', async () => {
      const {code} = await transformFile(
        'options-first',
        createOptions({
          transformers: [[transformer, {privacy: 'hard'}]],
        }),
      );
      expect(code).toMatchSnapshot();
    });

    it('compiles in another way if option has different state', async () => {
      const {code} = await transformFile(
        'options-second',
        createOptions({
          transformers: [[transformer, {privacy: 'none'}]],
        }),
      );
      expect(code).toMatchSnapshot();
    });

    it('sends a Babel tools object and transformer options to the transformer function', async () => {
      const {code} = await transformFile('transformer-params');
      expect(code).toMatchSnapshot();
    });

    it('sends transformer options and Babel plugin options to a decorator', async () => {
      const {code} = await transformFile('decorator-params');
      expect(code).toMatchSnapshot();
    });

    it('allows to specify options with JSON', async () => {
      const {code} = await transformFile('json', 'options.json');
      expect(code).toMatchSnapshot();
    });

    it('throws an error if filename is not provided', async () => {
      await expect(
        transform('errors', 'options-filename'),
      ).rejects.toThrowError(
        '[AST Decorators]: AST Decorators system requires filename to be set',
      );
    });

    it('throws an error if transformers option is not provided', async () => {
      await expect(
        transform('errors', 'options-transformers'),
      ).rejects.toThrowError('[AST Decorators]: No transformers provided');
    });
  });
});
