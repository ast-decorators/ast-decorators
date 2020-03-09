import {
  ClassDeclaration,
  ClassExpression,
  ClassMethod,
  ClassPrivateMethod,
  ClassPrivateProperty,
  ClassProperty,
} from '@babel/types';
import {NodePath} from '@babel/core';

export type DecorableClass = ClassDeclaration | ClassExpression;
export type DecorableClassMember =
  | ClassProperty
  | ClassPrivateProperty
  | ClassMethod
  | ClassPrivateMethod;

export type ASTDecoratorPluginOptions = Readonly<{
  privacy?: 'hard' | 'soft' | 'none';
  override?: Record<string, Omit<ASTDecoratorPluginOptions, 'override'>>;
}>;

export type ASTClassDecorator = (
  klass: NodePath<DecorableClass>,
  opts?: ASTDecoratorPluginOptions,
) => void;

export type ASTClassMemberDecorator = (
  klass: NodePath<DecorableClass>,
  member: NodePath<DecorableClassMember>,
  opts?: ASTDecoratorPluginOptions,
) => void;
