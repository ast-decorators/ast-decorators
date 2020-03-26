// TODO: remove eslint-disable when typescript-eslint can handle TS 3.8 properly
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {NodePath} from '@babel/core';
import {Binding} from '@babel/traverse';
import {
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

export default class DecoratorMetadata {
  readonly #args: readonly NodePath[];
  readonly #binding?: Binding;
  readonly #decorator: NodePath<Decorator>;
  readonly #id: NodePath<Identifier>;
  readonly #isCall: boolean;
  readonly #object?: NodePath<Identifier>;

  public constructor(decorator: NodePath<Decorator>) {
    this.#decorator = decorator;
    const expression = decorator.get('expression');

    this.#isCall = isCallExpression(expression);

    let idOrMember: NodePath<MemberExpression | Identifier>;

    if (this.#isCall) {
      this.#args = expression.get('arguments') as readonly NodePath[];
      idOrMember = expression.get('callee') as NodePath<
        MemberExpression | Identifier
      >;
    } else {
      this.#args = [];
      idOrMember = expression as NodePath<MemberExpression | Identifier>;
    }

    if (isMemberExpression(idOrMember)) {
      this.#object = expression.get('object') as NodePath<Identifier>;
      this.#id = expression.get('property') as NodePath<Identifier>;
    } else {
      this.#id = expression as NodePath<Identifier>;
    }

    if (this.isFree) {
      this.#binding = decorator.scope.getBinding(this.#id.node.name);
    } else {
      this.#binding = decorator.scope.getBinding(this.#object!.node.name);
    }
  }

  public get args(): readonly NodePath[] {
    return this.#args;
  }

  public get binding(): Binding | undefined {
    return this.#binding;
  }

  public get identifier(): NodePath<Identifier> {
    return this.isFree ? this.#id : this.#object!;
  }

  public get importSpecifier():
    | NodePath<
        ImportSpecifier | ImportNamespaceSpecifier | ImportDefaultSpecifier
      >
    | undefined {
    return this.#binding ? (this.#binding.path as any) : undefined;
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
    return this.#isCall;
  }

  /**
   * Is decorator identifier or a part of MemberExpression?
   */
  public get isFree(): boolean {
    return !this.#object;
  }

  public get property(): NodePath<Identifier> | undefined {
    return this.isFree ? undefined : this.#id;
  }

  public removeDecorator(): void {
    this.#decorator.remove();
  }

  public removeBinding(): void {
    if (!this.#binding) {
      return;
    }

    this.#binding.referencePaths = this.#binding.referencePaths.filter(
      p => p !== this.identifier,
    );

    if (this.#binding.referencePaths.length === 0) {
      const declaration = this.importSpecifier!.parentPath as NodePath<
        ImportDeclaration
      >;

      this.importSpecifier!.remove();

      if (declaration.node.specifiers.length === 0) {
        declaration.remove();
      }
    }
  }
}
