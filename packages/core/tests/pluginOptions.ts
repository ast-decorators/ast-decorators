import {
  compare as _compare,
  transform as _transform,
} from '../../../utils/testing';
import transformer from './fixtures/plugin-options/transformer';
import createOptions from './fixtures/plugin-options/options';

const compare = async (fixture: string, options: object): Promise<void> =>
  _compare(__dirname, 'plugin-options', fixture, options);

const transform = async (
  fixture: string,
  options: string,
): ReturnType<typeof _transform> =>
  _transform(__dirname, 'plugin-options', fixture, options);

describe('@ast-decorators/core', () => {
  describe('plugin-options', () => {
    it('compiles in one way if option has one state', async () => {
      await compare(
        'options-first',
        createOptions({
          transformers: [[transformer, {privacy: 'hard'}]],
        }),
      );
    });

    it('compiles in another way if option has different state', async () => {
      await compare(
        'options-second',
        createOptions({
          transformers: [[transformer, {privacy: 'none'}]],
        }),
      );
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
