import {transformFile as _transformFile} from '../../../utils/testing';
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

    it('fails if decorator applied to something other than method', async () => {
      await expect(
        transformFile('failure-no-method', commonOptions),
      ).rejects.toThrowError(
        'Applying @bind decorator to something other than method is not allowed',
      );
    });
  });
});
