import type {BabelFileResult} from '@babel/core';
import type {NodePath} from '@babel/traverse';
import type {
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

export type ASTClassMemberDecorator<
  O extends object = object,
  M extends ClassMember = ClassMember
> = (
  klass: NodePath<Class>,
  member: NodePath<M>,
  transformerOptions: O | undefined,
  babelOptions: PluginPass<ASTDecoratorCoreOptions>,
) => void;

export type ASTClassCallableDecorator<
  A extends any[] = any[],
  O extends object = object
> = (...args: A) => ASTClassDecorator<O>;

export type ASTClassMemberCallableDecorator<
  A extends any[] = any[],
  O extends object = object,
  M extends ClassMember = ClassMember
> = (...args: A) => ASTClassMemberDecorator<O, M>;

export type ASTSimpleDecorator<
  O extends object = object,
  M extends ClassMember = ClassMember
> = ASTClassDecorator<O> | ASTClassMemberDecorator<O, M>;

export type ASTCallableDecorator<
  A extends any[] = any[],
  O extends object = object,
  M extends ClassMember = ClassMember
> = ASTClassCallableDecorator<A, O> | ASTClassMemberCallableDecorator<A, O, M>;

export type ASTDecorator<
  A extends any[] = any[],
  O extends object = object,
  M extends ClassMember = ClassMember
> = ASTSimpleDecorator<O, M> | ASTCallableDecorator<A, O, M>;

export type ASTDecoratorDetector<T extends object = object> = (
  name: string,
  path: string,
  transformerOptions: object | undefined,
  babelOptions: PluginPass,
) => boolean;

export type ASTDecoratorTransformer<
  A extends any[] = any[],
  O extends object = object,
  M extends ClassMember = ClassMember
> = (
  babel: object,
  transformerOptions?: O,
) => ReadonlyArray<readonly [ASTDecorator<A, O, M>, ASTDecoratorDetector<O>]>;

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
