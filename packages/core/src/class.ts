import {DecorableClass} from '@ast-decorators/utils/lib/commonTypes';
import {ASTDecoratorPluginOptions} from '@ast-decorators/utils/src/commonTypes';
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
