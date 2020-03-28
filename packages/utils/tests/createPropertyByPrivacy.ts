import {compare as _compare} from '../../../utils/testing';

const compare = async (fixture: string): Promise<void> =>
  _compare(__dirname, 'createPropertyByPrivacy', fixture);

describe('@ast-decorators/utils', () => {
  describe('createPropertyByPrivacy', () => {
    it('creates property when compiles with hard privacy option', async () => {
      await compare('hard');
    });

    it('creates property when compiles with soft privacy option', async () => {
      await compare('soft');
    });

    it('creates property when compiles with none privacy option', async () => {
      await compare('none');
    });

    it('creates static property', async () => {
      await compare('static');
    });
  });
});
