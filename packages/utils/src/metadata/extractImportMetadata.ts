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
  isImportSpecifier,
} from '@babel/types';

export type ImportMetadata = Readonly<{
  binding?: Binding;
  identifier: Identifier;
  importIdentifier: Identifier;
  importSpecifier?:
    | ImportSpecifier
    | ImportNamespaceSpecifier
    | ImportDefaultSpecifier;
  importSource?: StringLiteral;
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

  const importDeclaration = importSpecifier?.parentPath as
    | NodePath<ImportDeclaration>
    | undefined;

  return {
    binding,
    identifier: identifier.node,
    importIdentifier: importIdentifier.node,
    importSource: importDeclaration?.node.source,
    importSpecifier: importSpecifier?.node,
    isMember,
    originalImportName: importSpecifier
      ? isImportDefaultSpecifier(importSpecifier.node)
        ? 'default'
        : isImportNamespaceSpecifier(importSpecifier.node)
        ? identifier.node.name
        : isImportSpecifier(importSpecifier.node)
        ? importSpecifier.node.imported.name
        : undefined
      : undefined,
    removeBinding(): void {
      if (!binding) {
        return;
      }

      binding.referencePaths = binding.referencePaths.filter(
        (p) => p !== importIdentifier,
      );

      if (binding.referencePaths.length === 0) {
        importSpecifier!.remove();

        if (importDeclaration!.node.specifiers.length === 0) {
          importDeclaration!.remove();
        }
      }
    },
  };
};

export default extractImportMetadata;
