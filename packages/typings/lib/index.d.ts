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

export type PluginPass<T = object> = Readonly<{
  cwd: string;
  file: BabelFileResult;
  filename: string;
  key: string;
  opts?: T;
}>;

export type PrivacyType = 'hard' | 'soft' | 'none';

export type ASTClassDecorator<O extends object = object> = (
  klass: NodePath<DecorableClass>,
  transformerOptions: O | undefined,
  babelOptions: PluginPass<ASTDecoratorCoreOptions>,
) => void;

export type ASTClassMemberDecorator<O extends object = object> = (
  klass: NodePath<DecorableClass>,
  member: NodePath<DecorableClassMember>,
  transformerOptions: O | undefined,
  babelOptions: PluginPass<ASTDecoratorCoreOptions>,
) => void;

export type ASTClassCallableDecorator<
  A extends any[] = any[],
  O extends object = object
> = (...args: A) => ASTClassDecorator<O>;

export type ASTClassMemberCallableDecorator<
  A extends any[] = any[],
  O extends object = object
> = (...args: A) => ASTClassMemberDecorator<O>;

export type ASTSimpleDecorator<O extends object = object> =
  | ASTClassDecorator<O>
  | ASTClassMemberDecorator<O>;

export type ASTCallableDecorator<
  A extends any[] = any[],
  O extends object = object
> = ASTClassCallableDecorator<A, O> | ASTClassMemberCallableDecorator<A, O>;

export type ASTDecorator = ASTSimpleDecorator | ASTCallableDecorator;

export type ASTDecoratorDetector = (
  name: string,
  path: string,
  options: PluginPass,
) => boolean;

export type ASTDecoratorTransformer = (
  babel: object,
  transformerOptions?: object,
) => ReadonlyArray<readonly [ASTDecorator, ASTDecoratorDetector]>;

export type ASTDecoratorExclusionOptions = Readonly<{
  names?: ReadonlyArray<RegExp | string>;
  nodeModules?: ReadonlyArray<RegExp | string>;
  paths?: readonly string[];
}>;

export type ASTDecoratorCoreOptions = Readonly<{
  transformers?: ReadonlyArray<
    | string
    | ASTDecoratorTransformer
    | [string, object]
    | [ASTDecoratorTransformer, object]
  >;
}>;
