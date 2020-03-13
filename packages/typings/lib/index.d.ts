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

export type ASTDecoratorTransformerOptions<
  N extends string = string,
  O extends object = object
> = Partial<Readonly<Record<N, O>>>;

export type PrivacyType = 'hard' | 'soft' | 'none';

export type ASTClassDecorator<
  N extends string = string,
  O extends object = object
> = (
  klass: NodePath<DecorableClass>,
  opts?: ASTDecoratorTransformerOptions<N, O>,
) => void;

export type ASTClassMemberDecorator<
  N extends string = string,
  O extends object = object
> = (
  klass: NodePath<DecorableClass>,
  member: NodePath<DecorableClassMember>,
  opts?: ASTDecoratorTransformerOptions<N, O>,
) => void;
