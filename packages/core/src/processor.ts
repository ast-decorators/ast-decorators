import {
  ASTCallableDecorator,
  ASTSimpleDecorator,
  DecorableClass,
  DecorableClassMember,
  PluginPass,
} from '@ast-decorators/typings';
import ASTDecoratorsError from '@ast-decorators/utils/lib/ASTDecoratorsError';
import checkNodeModule from '@ast-decorators/utils/lib/checkNodeModule';
import DecoratorMetadata from '@ast-decorators/utils/lib/DecoratorMetadata';
import {NodePath} from '@babel/core';
import {
  Decorator,
  Identifier,
  isFunctionDeclaration,
  isImportDefaultSpecifier,
  isImportNamespaceSpecifier,
  isVariableDeclarator,
  StringLiteral,
} from '@babel/types';
import {dirname, resolve} from 'path';
import {TransformerMap} from './utils';

type DecoratorProcessorArguments = {
  call: readonly NodePath[];
  decorator: readonly [
    NodePath<DecorableClass>,
    NodePath<DecorableClassMember>?,
  ];
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
  const {importSpecifier, importSource} = metadata;

  const name = isImportDefaultSpecifier(importSpecifier)
    ? 'default'
    : isImportNamespaceSpecifier(importSpecifier)
    ? metadata.property!.node.name
    : (importSpecifier!.get('imported') as NodePath<Identifier>).node.name;

  const source = calculateSource(importSource!, filename);

  const transformer = transformerMap.find(([, detector]) =>
    detector(name, source, babelOptions),
  );

  if (!transformer) {
    return;
  }

  const [decoratorFn, , transformerOptions] = transformer;

  metadata.removeDecorator();
  metadata.removeBinding();

  const decorator = metadata.isCall
    ? (decoratorFn as ASTCallableDecorator)(...args.call)
    : (decoratorFn as ASTSimpleDecorator);

  // @ts-ignore
  decorator(...args.decorator, transformerOptions, babelOptions);
};

const processDecorator = (
  decorator: NodePath<Decorator>,
  args: readonly [NodePath<DecorableClass>, NodePath<DecorableClassMember>?],
  transformerMap: TransformerMap,
  options: PluginPass,
): void => {
  const metadata = new DecoratorMetadata(decorator);

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
      `${metadata.identifier.node.name} is not defined`,
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
