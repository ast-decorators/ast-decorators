export default class ASTDecoratorsError extends Error {
  public constructor(message?: string) {
    super(`[AST Decorators]${message ? `: ${message}` : ''}`);
  }
}
