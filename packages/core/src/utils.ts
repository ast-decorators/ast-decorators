import {ASTDecoratorTransformerOptions} from '@ast-decorators/typings';
import {BabelFileResult, NodePath} from '@babel/core';
import {Binding} from '@babel/traverse';
import {
  CallExpression,
  Decorator,
  Identifier,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
  isCallExpression,
  isMemberExpression,
  MemberExpression,
  StringLiteral,
} from '@babel/types';

export type ASTDecoratorExclusionOptions = {
  paths?: string[];
  names?: RegExp | string[];
};

export type ASTDecoratorCoreOptions = Readonly<{
  exclude?: ASTDecoratorExclusionOptions;
  transformers?: ASTDecoratorTransformerOptions;
}>;

export type PluginPass<T> = Readonly<{
  cwd: string;
  file: BabelFileResult;
  filename?: string;
  key: string;
  opts?: T;
}>;

const $args = Symbol('args');
const $binding = Symbol('binding');
const $decorator = Symbol('decorators');
const $id = Symbol('id');
const $isCall = Symbol('isCall');
const $object = Symbol('object');

const $handleDecoratorWithArgs = Symbol('handleDecoratorWithArgs');
const $handleDecoratorWithoutArgs = Symbol('handleDecoratorWithoutArgs');
const $handleMemberDecorator = Symbol('handleMemberDecorator');

export default class DecoratorMetadata {
  private [$args]?: readonly NodePath[];
  private [$binding]?: Binding;
  private [$decorator]: NodePath<Decorator>;
  private [$id]: NodePath<Identifier>;
  private [$isCall]: boolean;
  private [$object]?: NodePath<Identifier>;

  public constructor(decorator: NodePath<Decorator>) {
    this[$decorator] = decorator;
    const expression = decorator.get('expression');

    this[$isCall] = isCallExpression(expression);

    if (this[$isCall]) {
      this[$handleDecoratorWithArgs](expression as NodePath<CallExpression>);
    } else {
      this[$handleDecoratorWithoutArgs](
        expression as NodePath<MemberExpression | Identifier>,
      );
    }

    if (this.isFree) {
      this[$binding] = decorator.scope.getBinding(this[$id]!.node.name);
    } else {
      this[$binding] = decorator.scope.getBinding(this[$object]!.node.name);
    }
  }

  public get args(): readonly NodePath[] {
    return this[$args] ?? [];
  }

  public get binding(): Binding | undefined {
    return this[$binding];
  }

  public get bindingId(): NodePath<Identifier> {
    return this.isFree ? this[$id] : this[$object]!;
  }

  public get importSpecifier():
    | NodePath<
        ImportSpecifier | ImportNamespaceSpecifier | ImportDefaultSpecifier
      >
    | undefined {
    return this[$binding] ? (this[$binding]!.path as any) : undefined;
  }

  public get importSource(): NodePath<StringLiteral> | undefined {
    const {importSpecifier} = this;

    if (!importSpecifier) {
      return undefined;
    }

    const declaration = importSpecifier.parentPath as NodePath<
      ImportDeclaration
    >;

    return declaration.get('source');
  }

  public get isCall(): boolean {
    return this[$isCall];
  }

  /**
   * Is decorator identifier a part of MemberExpression?
   */
  public get isFree(): boolean {
    return !this[$object];
  }

  public get property(): string | undefined {
    return this.isFree ? undefined : this[$id].node.name;
  }

  public removeDecorator(): void {
    this[$decorator].remove();
  }

  public removeBinding(): void {
    if (!this[$binding]) {
      return;
    }

    this[$binding]!.referencePaths = this[$binding]!.referencePaths.filter(
      p => p !== this.bindingId,
    );

    if (this[$binding]!.referencePaths.length === 0) {
      const declaration = this.importSpecifier!.parentPath as NodePath<
        ImportDeclaration
      >;

      this.importSpecifier!.remove();

      if (declaration.node.specifiers.length === 0) {
        declaration.remove();
      }
    }
  }

  private [$handleDecoratorWithArgs](
    expression: NodePath<CallExpression>,
  ): void {
    this[$args] = expression.get('arguments');

    const callee = expression.get('callee');

    if (isMemberExpression(callee)) {
      this[$handleMemberDecorator](callee as NodePath<MemberExpression>);
    } else {
      this[$id] = callee as NodePath<Identifier>;
    }
  }

  private [$handleDecoratorWithoutArgs](
    expression: NodePath<MemberExpression | Identifier>,
  ): void {
    if (isMemberExpression(expression)) {
      this[$handleMemberDecorator](expression as NodePath<MemberExpression>);
    } else {
      this[$id] = expression as NodePath<Identifier>;
    }
  }

  private [$handleMemberDecorator](
    expression: NodePath<MemberExpression>,
  ): void {
    this[$object] = expression.get('object') as NodePath<Identifier>;
    this[$id] = expression.get('property') as NodePath<Identifier>;
  }
}
