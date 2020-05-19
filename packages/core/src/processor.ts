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
  Decorator,
  isFunctionDeclaration,
  isVariableDeclarator,
  StringLiteral,
} from '@babel/types';
import {dirname, resolve} from 'path';
import type {TransformerMap} from './utils';

type DecoratorProcessorArguments = {
  call: readonly NodePath[];
  decorator: readonly [NodePath<Class>, NodePath<ClassMember>?];
};

type ImportProcessorData = Readonly<{
  args: DecoratorProcessorArguments;
  metadata: DecoratorMetadata;
  options: PluginPass;
}>;

const calculateSource = (
  {node: {value}}: NodePath<StringLiteral>,
  filename: string,
): string =>
  checkNodeModule(value) ? value : resolve(dirname(filename), value);

const processImportDeclaration = (
  {args, metadata, options: babelOptions}: ImportProcessorData,
  transformerMap: TransformerMap,
): void => {
  const {filename} = babelOptions;
  const {importSource, originalImportName} = metadata;

  const source = calculateSource(importSource!, filename);

  const transformer = transformerMap.find(([, detector, transformerOptions]) =>
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    detector(originalImportName!, source, transformerOptions, babelOptions),
  );

  if (!transformer) {
    return;
  }

  const [decoratorFn, , transformerOptions] = transformer;

  metadata.remove();
  metadata.removeBinding();

  const decorator = metadata.isCall
    ? (decoratorFn as ASTCallableDecorator)(...args.call)
    : (decoratorFn as ASTSimpleDecorator);

  // @ts-ignore
  decorator(...args.decorator, transformerOptions, babelOptions);
};

const processDecorator = (
  decorator: NodePath<Decorator>,
  args: readonly [NodePath<Class>, NodePath<ClassMember>?],
  transformerMap: TransformerMap,
  options: PluginPass,
): void => {
  const metadata = extractDecoratorMetadata(decorator);

  const data = {
    args: {
      call: metadata.args,
      decorator: args,
    },
    metadata,
    options,
  };

  const binding = metadata.binding;

  if (!binding) {
    throw new ASTDecoratorsError(
      `${metadata.importIdentifier.node.name} is not defined`,
    );
  }

  if (
    isVariableDeclarator(binding.path) ||
    isFunctionDeclaration(binding.path)
  ) {
    throw new ASTDecoratorsError(
      'Decorator should be imported from a separate file',
    );
  } else {
    processImportDeclaration(data, transformerMap);
  }
};

export default processDecorator;
