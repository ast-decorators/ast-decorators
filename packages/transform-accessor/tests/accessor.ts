import {compare as _compare} from '../../../utils/testing';
import options from './fixtures/options';

const compare = async (fixture: string, type: string): Promise<void> =>
  _compare(__dirname, fixture, type, options);

describe('@ast-decorators/transform-accessor', () => {
  describe('@accessor', () => {
    it('compiles for decorator without interceptors', async () => {
      await compare('default', 'accessor');
    });

    it('compiles for decorator with inline arrow function interceptors', async () => {
      await compare('inline-arrow', 'accessor');
    });

    it('compiles for decorator with inline function interceptors', async () => {
      await compare('inline-function', 'accessor');
    });

    it('compiles for decorator with interceptors declared somewhere else', async () => {
      await compare('var', 'accessor');
    });
  });
});
