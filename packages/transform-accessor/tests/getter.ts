import {compare as _compare} from '../../../utils/testing';

const compare = async (fixture: string, type: string): Promise<void> =>
  _compare(__dirname, fixture, type);

describe('@ast-decorators/transform-accessor', () => {
  describe('@getter', () => {
    it('compiles for decorator without properties', async () => {
      await compare('default', 'getter');
    });
  });
});
