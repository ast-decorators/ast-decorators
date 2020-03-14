import {compare as _compare} from '../../../utils/testing';
import options from './fixtures/options';

const compare = async (fixture: string): Promise<void> =>
  _compare(__dirname, 'accessor', fixture, options);

const compareWithCustomOptions = async (fixture: string): Promise<void> =>
  _compare(__dirname, 'accessor', fixture);

describe('@ast-decorators/transform-accessor', () => {
  describe('@accessor', () => {
    it('compiles for decorator without interceptors', async () => {
      await compare('default');
    });

    it('preserves following decorators for both accessors', async () => {
      await compareWithCustomOptions('preserve-decorators-for-both');
    });

    it('preserves following decorators only for getter', async () => {
      await compareWithCustomOptions('preserve-decorators-for-single');
    });
  });
});
