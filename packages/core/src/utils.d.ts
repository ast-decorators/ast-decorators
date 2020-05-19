import type {
  ASTDecorator,
  ASTDecoratorDetector,
} from '@ast-decorators/utils/lib/common';

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type TransformerMapItem = readonly [
  ASTDecorator,
  ASTDecoratorDetector,
  object?,
];

export type TransformerMap = readonly TransformerMapItem[];
