import {compare as _compare} from '../../../utils/testing';
import options from './fixtures/options';

describe('@ast-decorators/core', () => {
  describe('class', () => {
    const compare = async (fixture: string): Promise<void> =>
      _compare(__dirname, 'class', fixture, options);

    it('compiles decorator for a class', async () => {
      await compare('default');
    });

    it('compiles multiple decorators for a class', async () => {
      await compare('multiple-decorators');
    });

    it('compiles decorators imported as namespace', async () => {
      await compare('namespace');
    });

    it('compiles decorators with params', async () => {
      await compare('params');
    });
  });
});
