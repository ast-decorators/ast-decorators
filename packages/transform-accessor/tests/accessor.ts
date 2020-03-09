import {compare as _compare} from '../../../utils/testing';
import options from './fixtures/options';

const compare = async (fixture: string): Promise<void> =>
  _compare(__dirname, 'accessor', fixture, options);

describe('@ast-decorators/transform-accessor', () => {
  describe('@accessor', () => {
    it('compiles for decorator without interceptors', async () => {
      await compare('default');
    });
  });
});
