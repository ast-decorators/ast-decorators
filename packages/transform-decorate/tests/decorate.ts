import {compare as _compare} from '../../../utils/testing';
import commonOptions from './fixtures/options';

const compare = async (
  fixture: string,
  options?: string | object,
): Promise<void> => _compare(__dirname, 'decorate', fixture, options);

describe('@ast-decorators/transform-decorate', () => {
  describe('@decorate', () => {
    it('compiles for a method with inline arrow decorator', async () => {
      await compare('method-inline-arrow', commonOptions);
    });

    it('compiles for a method with inline regular decorator', async () => {
      await compare('method-inline-regular', commonOptions);
    });

    it('compiles for a method with decorator declared in the same file', async () => {
      await compare('method-within-arrow', commonOptions);
    });
  });
});
