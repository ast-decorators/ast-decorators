import {compare as _compare} from '../../../utils/testing';
import options from './fixtures/options';

const compare = async (fixture: string, type: string): Promise<void> =>
  _compare(__dirname, fixture, type, options);

describe('@ast-decorators/transform-accessor', () => {
  describe('@setter', () => {
    it('compiles for decorator without interceptor', async () => {
      await compare('default', 'setter');
    });

    it('compiles for decorator with inline arrow function interceptor', async () => {
      await compare('inline-arrow', 'setter');
    });

    it('compiles for decorator with inline function interceptor', async () => {
      await compare('inline-function', 'setter');
    });

    it('compiles for decorator with interceptor declared somewhere else', async () => {
      await compare('var', 'setter');
    });
  });
});
