import {compare as _compare} from '../../../utils/testing';

const compare = async (fixture: string): Promise<void> =>
  _compare(__dirname, 'createPropertyByPrivacy', fixture);

describe('@ast-decorators/utils', () => {
  describe('createPropertyByPrivacy', () => {
    it('compiles for decorator with hard privacy option', async () => {
      await compare('hard');
    });

    it('compiles for decorator with soft privacy option', async () => {
      await compare('soft');
    });

    it('compiles for decorator with none privacy option', async () => {
      await compare('none');
    });
  });
});
