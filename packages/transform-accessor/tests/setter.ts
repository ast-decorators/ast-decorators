import {compare as _compare} from '../../../utils/testing';
import options from './fixtures/options';

const compare = async (fixture: string): Promise<void> =>
  _compare(__dirname, 'setter', fixture, options);

describe('@ast-decorators/transform-accessor', () => {
  describe('@setter', () => {
    it('compiles for decorator without interceptor', async () => {
      await compare('default');
    });

    it('compiles for decorator with inline arrow function interceptor', async () => {
      await compare('inline-arrow');
    });

    it('compiles for decorator with inline function interceptor', async () => {
      await compare('inline-function');
    });

    it('compiles for decorator with interceptor declared somewhere else', async () => {
      await compare('var');
    });

    it('compiles for decorator on private property', async () => {
      await compare('private-property');
    });

    it('compiles for decorator on property with assignment', async () => {
      await compare('property-assigning');
    });

    it('throws an error if applied to something else than property', async () => {
      await expect(compare('assert-property-type')).rejects.toThrowError(
        'Applying @setter decorator to something other than property is not allowed',
      );
    });

    it('throws an error if interceptor is something else than function or identifier', async () => {
      await expect(compare('assert-interceptor-type')).rejects.toThrowError(
        'Accessor interceptor can only be function or a variable identifier',
      );
    });
  });
});
