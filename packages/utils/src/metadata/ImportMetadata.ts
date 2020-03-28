// TODO: remove eslint-disable when typescript-eslint can handle TS 3.8 properly
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {NodePath} from '@babel/core';
import {Binding} from '@babel/traverse';
import {
  Identifier,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
  isMemberExpression,
  MemberExpression,
  StringLiteral,
  isImportDefaultSpecifier,
  isImportNamespaceSpecifier,
} from '@babel/types';

export default class ImportMetadata {
  readonly #binding?: Binding;
  readonly #id: NodePath<Identifier>;
  readonly #object?: NodePath<Identifier>;

  public constructor(
    memberOrIdentifier: NodePath<MemberExpression | Identifier>,
  ) {
    if (isMemberExpression(memberOrIdentifier)) {
      this.#object = memberOrIdentifier.get('object') as NodePath<Identifier>;
      this.#id = memberOrIdentifier.get('property') as NodePath<Identifier>;
    } else {
      this.#id = memberOrIdentifier as NodePath<Identifier>;
    }

    if (this.isMember) {
      this.#binding = memberOrIdentifier.scope.getBinding(
        this.#object!.node.name,
      );
    } else {
      this.#binding = memberOrIdentifier.scope.getBinding(this.#id.node.name);
    }
  }

  public get binding(): Binding | undefined {
    return this.#binding;
  }

  public get identifier(): NodePath<Identifier> {
    return this.#id;
  }

  public get importIdentifier(): NodePath<Identifier> {
    return this.isMember ? this.#object! : this.#id;
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

  public get isMember(): boolean {
    return !!this.#object;
  }

  public get originalImportName(): string | undefined {
    const {identifier, importSpecifier} = this;

    if (!importSpecifier) {
      return undefined;
    }

    return isImportDefaultSpecifier(importSpecifier)
      ? 'default'
      : isImportNamespaceSpecifier(importSpecifier)
      ? identifier.node.name
      : (importSpecifier.get('imported') as NodePath<Identifier>).node.name;
  }

  public removeBinding(): void {
    if (!this.#binding) {
      return;
    }

    this.#binding.referencePaths = this.#binding.referencePaths.filter(
      p => p !== this.importIdentifier,
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
