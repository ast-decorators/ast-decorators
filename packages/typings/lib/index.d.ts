import {
  ClassDeclaration,
  ClassExpression,
  ClassMethod,
  ClassPrivateMethod,
  ClassPrivateProperty,
  ClassProperty,
} from '@babel/types';
import {BabelFileResult, NodePath} from '@babel/core';

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

export type ASTDecoratorExclusionOptions = Readonly<{
  names?: ReadonlyArray<RegExp | string>;
  nodeModules?: ReadonlyArray<RegExp | string>;
  paths?: readonly string[];
}>;

export type ASTDecoratorCoreOptions<T> = Readonly<{
  exclude?: ASTDecoratorExclusionOptions;
  transformers?: T;
}>;

export type PluginPass<T> = Readonly<{
  cwd: string;
  file: BabelFileResult;
  filename: string;
  key: string;
  opts?: T;
}>;

export type ASTClassDecorator<
  N extends string = string,
  O extends object = object
> = (
  klass: NodePath<DecorableClass>,
  options?: PluginPass<
    ASTDecoratorCoreOptions<ASTDecoratorTransformerOptions<N, O>>
  >,
) => void;

export type ASTClassMemberDecorator<
  N extends string = string,
  O extends object = object
> = (
  klass: NodePath<DecorableClass>,
  member: NodePath<DecorableClassMember>,
  options: PluginPass<
    ASTDecoratorCoreOptions<ASTDecoratorTransformerOptions<N, O>>
  >,
) => void;
