import type {
  ASTDecorator,
  ASTDecoratorDetector,
  ClassMember,
} from '@ast-decorators/utils/lib/common';
import type {NodePath} from '@babel/traverse';
import type {Class} from '@babel/types';

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type TransformerMapItem = readonly [
  ASTDecorator,
  ASTDecoratorDetector,
  object?,
];

export type TransformerMap = readonly TransformerMapItem[];

export type Entities = readonly [NodePath<Class>, NodePath<ClassMember>?];
export type EntitiesExtractor = (
  path: NodePath<Class> | NodePath<ClassMember>,
) => Entities;
