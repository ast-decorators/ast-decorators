// TODO: remove eslint-disable when typescript-eslint can handle TS 3.8 properly
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import type {NodePath, Binding} from '@babel/traverse';
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

export type ImportMetadata = Readonly<{
  binding?: Binding;
  identifier: NodePath<Identifier>;
  importIdentifier: NodePath<Identifier>;
  importSpecifier?: NodePath<
    ImportSpecifier | ImportNamespaceSpecifier | ImportDefaultSpecifier
  >;
  importSource?: NodePath<StringLiteral>;
  isMember: boolean;
  originalImportName?: string;
  removeBinding: () => void;
}>;

const extractImportMetadata = (
  memberOrIdentifier: NodePath<MemberExpression> | NodePath<Identifier>,
): ImportMetadata => {
  const isMember = isMemberExpression(memberOrIdentifier);

  let binding: Binding | undefined;
  let importIdentifier: NodePath<Identifier>;
  let identifier: NodePath<Identifier>;

  if (isMember) {
    const object = memberOrIdentifier.get('object') as NodePath<Identifier>;

    identifier = memberOrIdentifier.get('property') as NodePath<Identifier>;
    binding = memberOrIdentifier.scope.getBinding(object.node.name);
    importIdentifier = object;
  } else {
    identifier = memberOrIdentifier as NodePath<Identifier>;
    binding = memberOrIdentifier.scope.getBinding(identifier.node.name);
    importIdentifier = identifier;
  }

  const importSpecifier = binding?.path as
    | NodePath<
        ImportSpecifier | ImportNamespaceSpecifier | ImportDefaultSpecifier
      >
    | undefined;

  return {
    binding,
    identifier,
    importIdentifier,
    importSource: (importSpecifier?.parentPath as NodePath<
      ImportDeclaration
    >).get('source'),
    importSpecifier,
    isMember,
    originalImportName: importSpecifier
      ? isImportDefaultSpecifier(importSpecifier)
        ? 'default'
        : isImportNamespaceSpecifier(importSpecifier)
        ? identifier.node.name
        : (importSpecifier.get('imported') as NodePath<Identifier>).node.name
      : undefined,
    removeBinding(): void {
      if (!binding) {
        return;
      }

      binding.referencePaths = binding.referencePaths.filter(
        p => p !== importIdentifier,
      );

      if (binding.referencePaths.length === 0) {
        const declaration = importSpecifier!.parentPath as NodePath<
          ImportDeclaration
        >;

        importSpecifier!.remove();

        if (declaration.node.specifiers.length === 0) {
          declaration.remove();
        }
      }
    },
  };
};

export default extractImportMetadata;
