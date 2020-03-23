import {compare as _compare} from '../../../utils/testing';

describe('@ast-decorators/core', () => {
  describe('class-member', () => {
    const compare = async (fixture: string): Promise<void> =>
      _compare(__dirname, 'class-member', fixture);

    it('compiles decorator for a public property', async () => {
      await compare('public-property');
    });

    it('compiles decorator for a private property', async () => {
      await compare('private-property');
    });

    it('compiles decorator for a public method', async () => {
      await compare('public-method');
    });

    it('compiles decorator for a private method', async () => {
      await compare('private-method');
    });

    it('compiles multiple decorators for a method', async () => {
      await compare('multiple-decorators');
    });

    it('compiles decorators imported as a namespace for a method', async () => {
      await compare('namespace');
    });
  });
});
