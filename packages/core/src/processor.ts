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
import minimatch from 'minimatch';
import {dirname, resolve, join} from 'path';
import DecoratorMetadata, {
  ASTDecoratorCoreOptions,
  ASTDecoratorExclusionOptions,
  PluginPass,
} from './utils';

const cwd = process.cwd();

const resolveSource = (
  importSource: NodePath<StringLiteral>,
  filename: string,
): string => resolve(dirname(filename), importSource.node.value);

const shouldExcludeDecorator = (
  {paths, names}: ASTDecoratorExclusionOptions,
  metadata: DecoratorMetadata,
  filename: string,
): boolean => {
  const importSpecifier = metadata.importSpecifier!;
  const name: string = importSpecifier.get('local').node.name;

  if (
    names &&
    (Array.isArray(names) ? names.includes(name) : names.test(name))
  ) {
    return true;
  }

  if (paths) {
    const filepath = resolveSource(metadata.importSource!, filename);

    return paths.some(path => minimatch(filepath, join(cwd, path)));
  }

  return false;
};

type DecoratorProcessorArguments = {
  call: readonly NodePath[];
  decorator: readonly NodePath[];
};

type ImportProcessorData = {
  args: DecoratorProcessorArguments;
  metadata: DecoratorMetadata;
  options: PluginPass<ASTDecoratorCoreOptions>;
};

const processImportDeclaration = ({
  args,
  metadata,
  options: {filename, opts: {exclude, transformers} = {}},
}: ImportProcessorData): void => {
  if (!filename) {
    throw new Error(
      'Current transformation is not based on files and is unable to handle imports',
    );
  }

  if (exclude && shouldExcludeDecorator(exclude, metadata, filename)) {
    return;
  }

  const {importSource, importSpecifier} = metadata;
  const filepath = resolveSource(importSource!, filename);
  // eslint-disable-next-line @typescript-eslint/no-require-imports,global-require
  const mod = require(filepath);

  const fn = isImportDefaultSpecifier(importSpecifier)
    ? mod.default
    : isImportNamespaceSpecifier(importSpecifier)
    ? mod[metadata.property!]
    : mod[(importSpecifier!.get('imported') as NodePath<Identifier>).node.name];

  metadata.removeDecorator();
  metadata.removeBinding();

  const decorator = metadata.isCall ? fn(...args.call) : fn;
  decorator(...args.decorator, transformers);
};

const processDecorator = (
  decorator: NodePath<Decorator>,
  args: readonly NodePath[],
  options: PluginPass<ASTDecoratorCoreOptions>,
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
    throw new Error(`${metadata.bindingId.node.name} is not defined`);
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
