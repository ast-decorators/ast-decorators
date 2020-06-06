import ASTDecoratorsError from '@ast-decorators/utils/lib/ASTDecoratorsError';
import checkNodeModule from '@ast-decorators/utils/lib/checkNodeModule';
import type {
  ASTCallableDecorator,
  ASTSimpleDecorator,
  ClassMember,
  PluginPass,
} from '@ast-decorators/utils/lib/common';
import {
  DecoratorMetadata,
  extractDecoratorMetadata,
} from '@ast-decorators/utils/lib/metadata';
import type {NodePath} from '@babel/traverse';
import {
  Class,
  cloneNode,
  Decorator,
  isFunctionDeclaration,
  isVariableDeclarator,
  StringLiteral,
} from '@babel/types';
import {dirname, resolve} from 'path';
import type {
  EntitiesExtractor,
  TransformerMap,
  TransformerMapItem,
} from './utils';

const calculateSource = ({value}: StringLiteral, filename: string): string =>
  checkNodeModule(value) ? value : resolve(dirname(filename), value);

const findTransformer = (
  {importSource, originalImportName}: DecoratorMetadata,
  transformerMap: TransformerMap,
  babelOptions: PluginPass,
): TransformerMapItem | undefined => {
  const {filename} = babelOptions;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const source = calculateSource(importSource!, filename);

  return transformerMap.find(([, detector, transformerOptions]) =>
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    detector(originalImportName!, source, transformerOptions, babelOptions),
  );
};

const processDecorator = (
  {args, isCall}: DecoratorMetadata,
  [klass, member]: readonly [NodePath<Class>, NodePath<ClassMember>?],
  transformer: TransformerMapItem,
  babelOptions: PluginPass,
): void => {
  const [decoratorFn, , transformerOptions] = transformer;

  const decorate = isCall
    ? (decoratorFn as ASTCallableDecorator)(...args)
    : (decoratorFn as ASTSimpleDecorator);

  decorate({klass, member}, transformerOptions, babelOptions);
};

const assertBinding = ({
  binding,
  importIdentifier,
}: DecoratorMetadata): void => {
  if (!binding) {
    throw new ASTDecoratorsError(`${importIdentifier.name} is not defined`);
  }

  if (
    isVariableDeclarator(binding.path) ||
    isFunctionDeclaration(binding.path)
  ) {
    throw new ASTDecoratorsError(
      'Decorator should be imported from a separate file',
    );
  }
};

const createNodeWithUnprocessedDecorators = (
  node: Class | ClassMember,
): Class | ClassMember => {
  const remainingDecorators = node.decorators.slice(0, -1);

  const replacement = cloneNode(node);
  replacement.decorators = remainingDecorators;

  return replacement;
};

const processDecorators = (
  path: NodePath<Class> | NodePath<ClassMember>,
  extractEntities: EntitiesExtractor,
  transformerMap: TransformerMap,
  options: PluginPass,
): void => {
  if (!options.filename) {
    throw new ASTDecoratorsError(
      'AST Decorators system requires filename to be set',
    );
  }

  if (!path.node.decorators?.length) {
    return;
  }

  let numberOfDecoratorsToSkip = 0;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition,no-constant-condition
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!path.node) {
      break;
    }

    const decorators = path.get('decorators') as ReadonlyArray<
      NodePath<Decorator>
    >;

    if (decorators.length === 0) {
      break;
    }

    const decorator =
      decorators[decorators.length - 1 - numberOfDecoratorsToSkip];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!decorator) {
      break;
    }

    const metadata = extractDecoratorMetadata(decorator);
    assertBinding(metadata);

    const transformer = findTransformer(metadata, transformerMap, options);

    if (!transformer) {
      numberOfDecoratorsToSkip += 1;
      continue;
    }

    path.replaceWith(createNodeWithUnprocessedDecorators(path.node));
    processDecorator(metadata, extractEntities(path), transformer, options);

    metadata.removeBinding();
  }
};

export default processDecorators;
