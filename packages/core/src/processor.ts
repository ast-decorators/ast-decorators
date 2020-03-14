import {
  ASTDecoratorCoreOptions,
  ASTDecoratorExclusionOptions,
  PluginPass,
} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {
  Decorator,
  Identifier,
  isFunctionDeclaration,
  isImportDefaultSpecifier,
  isImportNamespaceSpecifier,
  isVariableDeclarator,
} from '@babel/types';
import minimatch from 'minimatch';
import {dirname, join, resolve} from 'path';
import DecoratorMetadata from './utils';

const cwd = process.cwd();

const checkNodeModule = (source: string): boolean =>
  !source.startsWith('./') &&
  !source.startsWith('../') &&
  !source.startsWith('/');

const shouldExcludeDecorator = (
  {names, nodeModules, paths}: ASTDecoratorExclusionOptions,
  metadata: DecoratorMetadata,
  filename: string,
): boolean => {
  const {importSpecifier, importSource} = metadata;
  const name: string = importSpecifier!.get('local').node.name;
  const isNodeModule = checkNodeModule(importSource!.node.value);

  if (
    names &&
    names.some(rule =>
      typeof rule === 'string' ? rule === name : rule.test(name),
    )
  ) {
    return true;
  }

  if (paths && !isNodeModule) {
    const sourcePath = resolve(dirname(filename), importSource!.node.value);

    if (paths.some(rule => minimatch(sourcePath, join(cwd, rule)))) {
      return true;
    }
  }

  if (nodeModules && isNodeModule) {
    const sourcePath = importSource!.node.value;

    if (
      nodeModules.some(rule =>
        typeof rule === 'string'
          ? sourcePath.startsWith(rule) || minimatch(sourcePath, rule)
          : rule.test(sourcePath),
      )
    ) {
      return true;
    }
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
  const source = importSource!.node.value;
  const filepath = checkNodeModule(source)
    ? source
    : resolve(dirname(filename), source);

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
