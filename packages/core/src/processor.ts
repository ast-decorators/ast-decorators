import {
  ASTDecoratorCoreOptions,
  ASTDecoratorTransformerOptions,
  PluginPass,
} from '@ast-decorators/typings';
import checkDecoratorSuitability from '@ast-decorators/utils/lib/checkDecoratorSuitability';
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
} from '@babel/types';
import {dirname, resolve} from 'path';

type DecoratorProcessorArguments = {
  call: readonly NodePath[];
  decorator: readonly NodePath[];
};

type ImportProcessorData = {
  args: DecoratorProcessorArguments;
  metadata: DecoratorMetadata;
  options: PluginPass<ASTDecoratorCoreOptions<ASTDecoratorTransformerOptions>>;
};

const processImportDeclaration = ({
  args,
  metadata,
  options,
}: ImportProcessorData): void => {
  const {filename, opts} = options;
  const {importSpecifier, importSource} = metadata;

  if (
    opts?.exclude &&
    checkDecoratorSuitability(
      {
        name: importSpecifier!.node.local.name,
        source: importSource!.node.value,
      },
      opts.exclude,
      filename,
    )
  ) {
    return;
  }

  const source = importSource!.node.value;
  const filepath = checkNodeModule(source)
    ? source
    : resolve(dirname(filename), source);

  // eslint-disable-next-line @typescript-eslint/no-require-imports,global-require
  const mod = require(filepath);

  const fn = isImportDefaultSpecifier(importSpecifier)
    ? mod.default
    : isImportNamespaceSpecifier(importSpecifier)
    ? mod[metadata.property!.node.name]
    : mod[(importSpecifier!.get('imported') as NodePath<Identifier>).node.name];

  metadata.removeDecorator();
  metadata.removeBinding();

  const decorator = metadata.isCall ? fn(...args.call) : fn;
  decorator(...args.decorator, options);
};

const processDecorator = (
  decorator: NodePath<Decorator>,
  args: readonly NodePath[],
  options: PluginPass<ASTDecoratorCoreOptions<ASTDecoratorTransformerOptions>>,
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
    throw new Error(`${metadata.identifier.node.name} is not defined`);
  }

  if (
    isVariableDeclarator(binding.path) ||
    isFunctionDeclaration(binding.path)
  ) {
    throw new Error(
      'The AST decorator should be imported from a separate file',
    );
  } else {
    processImportDeclaration(data);
  }
};

export default processDecorator;
