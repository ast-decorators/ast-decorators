import {NodePath} from '@babel/core';
import {
  Decorator,
  Identifier,
  ImportDeclaration,
  isCallExpression,
  isFunctionDeclaration,
  isImportDefaultSpecifier,
  isImportNamespaceSpecifier,
  isVariableDeclarator,
} from '@babel/types';
import {dirname, resolve} from 'path';
import DecoratorMetadata from './utils';

export type DecoratorProcessorArguments = {
  call: readonly NodePath[];
  decorator: readonly NodePath[];
};

export type DecoratorProcessorOptions = {
  filename: string;
};

type ImportProcessorData = {
  args: DecoratorProcessorArguments;
  isCall: boolean;
  metadata: DecoratorMetadata;
  options: DecoratorProcessorOptions;
};

const processImportDeclaration = ({
  args,
  isCall,
  metadata,
  options: {filename},
}: ImportProcessorData): void => {
  if (!filename) {
    throw new Error(
      'Current transformation is not based on files and is unable to handle imports',
    );
  }

  const importSpecifier = metadata.importSpecifier!;

  const declaration = importSpecifier.parentPath as NodePath<ImportDeclaration>;
  const source = declaration.get('source');

  const filepath = resolve(dirname(filename), source.node.value);
  // eslint-disable-next-line @typescript-eslint/no-require-imports,global-require
  const mod = require(filepath);

  const fn = isImportDefaultSpecifier(importSpecifier)
    ? mod.default
    : isImportNamespaceSpecifier(importSpecifier)
    ? mod[metadata.property!]
    : mod[(importSpecifier.get('imported') as NodePath<Identifier>).node.name];

  const decorator = isCall ? fn(...args.call) : fn;
  decorator(...args.decorator);
};

const processDecorator = (
  decorator: NodePath<Decorator>,
  args: readonly NodePath[],
  options: DecoratorProcessorOptions,
): void => {
  const expression = decorator.get('expression');
  const isCall = isCallExpression(expression);

  const metadata = new DecoratorMetadata(decorator);

  const data = {
    args: {
      call: metadata.args,
      decorator: args,
    },
    isCall,
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
    decorator.remove();

    processImportDeclaration(data);

    metadata.removeBinding();
  }
};

export default processDecorator;
