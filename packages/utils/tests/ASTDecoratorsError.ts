import ASTDecoratorsError from '../src/ASTDecoratorsError';

describe('@ast-decorators/utils', () => {
  describe('ASTDecoratorsError', () => {
    it('adds [AST Decorators] part to each error message', () => {
      expect(() => {
        throw new ASTDecoratorsError('error');
      }).toThrowError('[AST Decorators]: error');
    });
  });
});
