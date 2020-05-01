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
      const {code} = await transformFile('default', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('compiles for private method', async () => {
      const {code} = await transformFile('private-method', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('compiles for private generator method', async () => {
      const {code} = await transformFile(
        'private-generator-method',
        commonOptions,
      );
      expect(code).toMatchSnapshot();
    });
  });
});
