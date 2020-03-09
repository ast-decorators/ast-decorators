import {
  ASTDecoratorPluginOptions,
  DecorableClass,
} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {Decorator} from '@babel/types';
import processDecorator from './processor';
import {PluginPass} from './utils';

const processClassDecorator = (
  decorator: NodePath<Decorator>,
  options: PluginPass<ASTDecoratorPluginOptions>,
): void => {
  const klass = decorator.parentPath as NodePath<DecorableClass>;

  processDecorator(decorator, [klass], options);
};

export default processClassDecorator;
