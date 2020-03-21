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

export type ASTDecoratorOptions<T extends object> = {
  corePlugin: PluginPass<ASTDecoratorCoreOptions>;
} & T;

export type PrivacyType = 'hard' | 'soft' | 'none';

export type ASTClassDecorator<O extends object = object> = (
  klass: NodePath<DecorableClass>,
  options?: ASTDecoratorOptions<O>,
) => void;

export type ASTClassMemberDecorator<O extends object = object> = (
  klass: NodePath<DecorableClass>,
  member: NodePath<DecorableClassMember>,
  options: ASTDecoratorOptions<O>,
) => void;

export type ASTClassCallableDecorator = (...args: any[]) => ASTClassDecorator;
export type ASTClassMemberCallableDecorator = (
  ...args: any[]
) => ASTClassMemberCallableDecorator;

export type ASTSimpleDecorator = ASTClassDecorator | ASTClassMemberDecorator;
export type ASTCallableDecorator =
  | ASTClassCallableDecorator
  | ASTClassMemberCallableDecorator;

export type ASTDecorator = ASTSimpleDecorator | ASTCallableDecorator;

export type ASTDecoratorDetector = (
  name: string,
  path: string,
  options: PluginPass,
) => boolean;

export type ASTDecoratorTransformer = [ASTDecorator, ASTDecoratorDetector];

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
