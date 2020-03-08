import {NodePath} from '@babel/core';
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
} from '@babel/types';

const $args = Symbol('args');
const $binding = Symbol('binding');
const $id = Symbol('id');
const $object = Symbol('object');

const $handleDecoratorWithArgs = Symbol('handleDecoratorWithArgs');
const $handleDecoratorWithoutArgs = Symbol('handleDecoratorWithoutArgs');
const $handleMemberDecorator = Symbol('handleMemberDecorator');

export default class DecoratorMetadata {
  private [$args]?: readonly NodePath[];
  private [$binding]?: Binding;
  private [$id]?: NodePath<Identifier>;
  private [$object]?: NodePath<Identifier>;

  public constructor(decorator: NodePath<Decorator>) {
    const expression = decorator.get('expression');

    if (isCallExpression(expression)) {
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
    return this.isFree ? this[$id]! : this[$object]!;
  }

  public get importSpecifier():
    | NodePath<
        ImportSpecifier | ImportNamespaceSpecifier | ImportDefaultSpecifier
      >
    | undefined {
    return this[$binding] ? (this[$binding]!.path as any) : undefined;
  }

  public get isFree(): boolean {
    return !this[$object];
  }

  public get property(): string | undefined {
    return this.isFree ? undefined : this[$id]!.node.name;
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
