import {compare as _compare} from '../../../utils/testing';

const compare = async (fixture: string, type: string): Promise<void> =>
  _compare(__dirname, fixture, type);

describe('AST Decorators', () => {
  describe('class', () => {
    it('compiles decorator for a class', async () => {
      await compare('default', 'class');
    });

    it('compiles multiple decorators for a class', async () => {
      await compare('multiple-decorators', 'class');
    });

    it('compiles decorators imported as namespace', async () => {
      await compare('namespace', 'class');
    });
  });

  describe('class-member', () => {
    it('compiles decorator for a public property', async () => {
      await compare('public-property', 'class-member');
    });

    it('compiles decorator for a private property', async () => {
      await compare('private-property', 'class-member');
    });

    it('compiles decorator for a public method', async () => {
      await compare('public-method', 'class-member');
    });

    it('compiles decorator for a private method', async () => {
      await compare('private-method', 'class-member');
    });

    it('compiles multiple decorators for a method', async () => {
      await compare('multiple-decorators', 'class-member');
    });

    it('compiles decorators imported as a namespace for a method', async () => {
      await compare('namespace', 'class-member');
    });
  });
});
