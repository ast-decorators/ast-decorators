import {transformFile as _transformFile} from '../../../utils/testing';
import commonOptions from './fixtures/class/options';

const transformFile = async (
  fixture: string,
  options?: string | object,
): ReturnType<typeof _transformFile> =>
  _transformFile(__dirname, 'class', fixture, options);

describe('@ast-decorators/core', () => {
  describe('class', () => {
    it('compiles decorator for a class', async () => {
      const {code} = await transformFile('default');
      expect(code).toMatchSnapshot();
    });

    it('compiles multiple decorators for a class', async () => {
      const {code} = await transformFile('multiple-decorators', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('compiles decorators imported as namespace', async () => {
      const {code} = await transformFile('namespace', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('compiles renamed decorators', async () => {
      const {code} = await transformFile('rename', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('compiles decorators with params', async () => {
      const {code} = await transformFile('params');
      expect(code).toMatchSnapshot();
    });

    it('ignores other decorators', async () => {
      const {code} = await transformFile('other-decorators', commonOptions);
      expect(code).toMatchSnapshot();
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
