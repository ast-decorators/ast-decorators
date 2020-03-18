import {
  ASTDecoratorCoreOptions,
  ASTDecoratorTransformerOptions,
  DecorableClass,
  PluginPass,
} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {Decorator} from '@babel/types';
import processDecorator from './processor';

const processClassDecorator = (
  decorator: NodePath<Decorator>,
  options: PluginPass<ASTDecoratorCoreOptions<ASTDecoratorTransformerOptions>>,
): void => {
  const klass = decorator.parentPath as NodePath<DecorableClass>;

  processDecorator(decorator, [klass], options);
};

export default processClassDecorator;
