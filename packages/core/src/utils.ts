import {ASTDecorator, ASTDecoratorDetector} from '@ast-decorators/typings';

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
export type TransformerMapItem = readonly [
  ASTDecorator,
  ASTDecoratorDetector,
  object?,
];
export type TransformerMap = readonly TransformerMapItem[];

export class ASTDecoratorsError extends Error {
  public constructor(message) {
    super(`[AST Decorators]: ${message}`);
  }
}
