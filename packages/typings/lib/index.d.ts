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

export type ASTDecoratorPluginOptions<
  N extends string = string,
  O extends object = object
> = Partial<Readonly<Record<N, O>>>;

export type PrivacyType = 'hard' | 'soft' | 'none';

export type ASTClassDecorator = (
  klass: NodePath<DecorableClass>,
  opts?: ASTDecoratorPluginOptions,
) => void;

export type ASTClassMemberDecorator = (
  klass: NodePath<DecorableClass>,
  member: NodePath<DecorableClassMember>,
  opts?: ASTDecoratorPluginOptions,
) => void;
