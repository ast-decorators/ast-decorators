export default class ASTDecoratorsError extends Error {
  public constructor(message) {
    super(`[AST Decorators]: ${message}`);
  }
}
