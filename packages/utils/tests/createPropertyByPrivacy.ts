import {transformFile as _transformFile} from '../../../utils/testing';

const transformFile = async (
  fixture: string,
): ReturnType<typeof _transformFile> =>
  _transformFile(__dirname, 'createPropertyByPrivacy', fixture);

describe('@ast-decorators/utils', () => {
  describe('createPropertyByPrivacy', () => {
    it('creates property when compiles with hard privacy option', async () => {
      const {code} = await transformFile('hard');
      expect(code).toMatchSnapshot();
    });

    it('creates property when compiles with soft privacy option', async () => {
      const {code} = await transformFile('soft');
      expect(code).toMatchSnapshot();
    });

    it('creates property when compiles with none privacy option', async () => {
      const {code} = await transformFile('none');
      expect(code).toMatchSnapshot();
    });

    it('creates static property', async () => {
      const {code} = await transformFile('static');
      expect(code).toMatchSnapshot();
    });
  });
});
