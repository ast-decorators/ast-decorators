import {
  compare as _compare,
  transformFile as _transformFile,
} from '../../../utils/testing';
import commonOptions from './fixtures/class/options';

const compare = async (
  fixture: string,
  options?: string | object,
): Promise<void> => _compare(__dirname, 'class', fixture, options);

const transformFile = async (
  fixture: string,
  options?: string | object,
): ReturnType<typeof _transformFile> =>
  _transformFile(__dirname, 'class', fixture, options);

describe('@ast-decorators/core', () => {
  describe('class', () => {
    it('compiles decorator for a class', async () => {
      await compare('default');
    });

    it('compiles multiple decorators for a class', async () => {
      await compare('multiple-decorators', commonOptions);
    });

    it('compiles decorators imported as namespace', async () => {
      await compare('namespace', commonOptions);
    });

    it('compiles renamed decorators', async () => {
      await compare('rename', commonOptions);
    });

    it('compiles decorators with params', async () => {
      await compare('params');
    });

    it('ignores other decorators', async () => {
      await compare('other-decorators', commonOptions);
    });

    it('throws an error if decorator is not declared', async () => {
      await expect(
        transformFile('not-defined', commonOptions),
      ).rejects.toThrowError('notDefined is not defined');
    });

    it('throws an error if decorator is declared in the same file', async () => {
      await expect(
        transformFile('defined-near', commonOptions),
      ).rejects.toThrowError(
        'Decorator should be imported from a separate file',
      );

      await expect(
        transformFile('defined-near-func', commonOptions),
      ).rejects.toThrowError(
        'Decorator should be imported from a separate file',
      );
    });
  });
});
