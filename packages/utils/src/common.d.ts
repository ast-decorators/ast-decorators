import {BabelFileResult, NodePath} from '@babel/core';
import {
  Class,
  ClassMethod,
  ClassPrivateMethod,
  ClassPrivateProperty,
  ClassProperty,
} from '@babel/types';

export type ClassMemberProperty = ClassProperty | ClassPrivateProperty;
export type ClassMemberMethod = ClassMethod | ClassPrivateMethod;

export type ClassMember = ClassMemberProperty | ClassMemberMethod;

export type PluginPass<T = object> = Readonly<{
  cwd: string;
  file: BabelFileResult;
  filename: string;
  key: string;
  opts?: T;
}>;

export type PrivacyType = 'hard' | 'soft' | 'none';

export type ASTClassDecorator<O extends object = object> = (
  klass: NodePath<Class>,
  transformerOptions: O | undefined,
  babelOptions: PluginPass<ASTDecoratorCoreOptions>,
) => void;

export type ASTClassMemberDecorator<O extends object = object> = (
  klass: NodePath<Class>,
  member: NodePath<ClassMember>,
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
  transformerOptions: object | undefined,
  babelOptions: PluginPass,
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
