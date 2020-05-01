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
      const {code} = await transformFile('default', commonOptions);
      expect(code).toMatchSnapshot();
    });
  });
});
