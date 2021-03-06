import {NodePath} from '@babel/traverse';
import {
  ArrowFunctionExpression,
  FunctionExpression,
  Identifier,
  isArrowFunctionExpression,
  isFunctionDeclaration,
  isFunctionExpression,
  isImportDeclaration,
  isMemberExpression,
  isVariableDeclarator,
  MemberExpression,
} from '@babel/types';
import ASTDecoratorsError from './ASTDecoratorsError';
import checkSuitability, {SuitabilityFactors} from './checkSuitability';
import {extractImportMetadata} from './metadata';

export type InterceptorKind =
  | FunctionExpression
  | ArrowFunctionExpression
  | Identifier
  | MemberExpression;

export type InterceptorContextOptions = Readonly<{
  disableByDefault?: boolean;
  exclude?: SuitabilityFactors;
}>;

const shouldInterceptorUseContext = (
  fn: NodePath<InterceptorKind> | undefined,
  {disableByDefault = false, exclude = {}}: InterceptorContextOptions = {},
  filename: string,
): boolean => {
  if (!fn) {
    return false;
  }

  // If it is a declared regular function, context should be used.
  if (isFunctionExpression(fn)) {
    return true;
  }

  // Is it is a declared arrow function, context is unnecessary.
  if (isArrowFunctionExpression(fn)) {
    return false;
  }

  const isMember = isMemberExpression(fn);

  const id = isMember
    ? (fn.get('object') as NodePath<Identifier>)
    : (fn as NodePath<Identifier>);

  const binding = fn.scope.getBinding(id.node.name);

  if (!binding) {
    throw new ASTDecoratorsError(`${id.node.name} is not defined`);
  }

  let name: string | undefined;
  let source: string | undefined;

  const {path: declarationOrSpecifier} = binding;

  if (isImportDeclaration(declarationOrSpecifier.parentPath)) {
    // If the callback is imported, let's use global transformer rules.

    const {importSource, originalImportName} = extractImportMetadata(
      fn as NodePath<MemberExpression> | NodePath<Identifier>,
    );

    name = originalImportName;
    source = importSource?.value;
  } else if (!isMember) {
    // If element is declared in the same file and it is an arrow or a regular
    // function, let's decide if we need to add context.

    if (isVariableDeclarator(declarationOrSpecifier)) {
      const init = declarationOrSpecifier.get('init');

      if (isFunctionExpression(init)) {
        return true;
      } else if (isArrowFunctionExpression(init)) {
        return false;
      }
    } else if (isFunctionDeclaration(declarationOrSpecifier)) {
      return true;
    }

    throw new ASTDecoratorsError(`${id.node.name} is not a function`);
  } else {
    // If our function is a part of an object, let's use global transformer
    // settings.
    ({name} = (fn.get('property') as NodePath<Identifier>).node);
  }

  const suitable = checkSuitability({name, source}, exclude, filename);

  // If context is disabled by default, all functions that fit "exclude" option
  // should use context. Otherwise, exclusions should not use context.
  return disableByDefault ? suitable : !suitable;
};

export default shouldInterceptorUseContext;
