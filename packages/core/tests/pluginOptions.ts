import {
  compare as _compare,
  transform as _transform,
} from '../../../utils/testing';

const compare = async (fixture: string): Promise<void> =>
  _compare(__dirname, 'plugin-options', fixture);

const transform = async (fixture: string): ReturnType<typeof _transform> =>
  _transform(__dirname, 'plugin-options', fixture);

describe('@ast-decorators/core', () => {
  describe('plugin-options', () => {
    it('compiles in one way if option has one state', async () => {
      await compare('options-first');
    });

    it('compiles in another way if option has different state', async () => {
      await compare('options-second');
    });

    it('throws an error if filename is not provided', async () => {
      await expect(transform('filename')).rejects.toThrowError(
        '[AST Decorators]: AST Decorators system requires filename to be set',
      );
    });
  });
});
