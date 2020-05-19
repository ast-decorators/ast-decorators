import {transformFile as _transformFile} from '../../../utils/testing';
import commonOptions from './fixtures/options';

const transformFile = async (
  fixture: string,
  options?: string | object,
): ReturnType<typeof _transformFile> =>
  _transformFile(__dirname, 'bindAll', fixture, options);

describe('@ast-decorators/transform-bind', () => {
  describe('@bindAll', () => {
    it('compiles for all methods in class', async () => {
      const {code} = await transformFile('class-default', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('fails if decorator applied to something other than class', async () => {
      await expect(
        transformFile('failure-no-class', commonOptions),
      ).rejects.toThrowError(
        'Applying @bindAll decorator to something other than class is not allowed',
      );
    });
  });
});
