import {compare as _compare} from '../../../utils/testing';
import options from './fixtures/options';

const compareDefault = async (fixture: string): Promise<void> =>
  _compare(__dirname, 'accessor', fixture, options);

const compare = async (fixture: string): Promise<void> =>
  _compare(__dirname, 'accessor', fixture);

describe('@ast-decorators/transform-accessor', () => {
  describe('@accessor', () => {
    it('compiles for decorator without interceptors', async () => {
      await compareDefault('default');
    });

    it('preserves following decorators for both accessors', async () => {
      await compareDefault('preserve-decorators-for-both');
    });

    it('preserves following decorators only for getter', async () => {
      await compare('preserve-decorators-for-single');
    });
  });
});
