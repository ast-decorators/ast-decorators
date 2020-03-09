import {compare as _compare} from '../../../utils/testing';

const compare = async (fixture: string): Promise<void> =>
  _compare(__dirname, 'options', fixture);

describe('@ast-decorators/core', () => {
  describe('options', () => {
    it('compiles in one way if option has one state', async () => {
      await compare('first');
    });

    it('compiles in another way if option has different state', async () => {
      await compare('second');
    });
  });
});
