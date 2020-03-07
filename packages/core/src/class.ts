import {DecorableClass} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {Decorator} from '@babel/types';
import processDecorator, {DecoratorProcessorOptions} from './processor';

const processClassDecorator = (
  decorator: NodePath<Decorator>,
  options: DecoratorProcessorOptions,
): void => {
  const klass = decorator.parentPath as NodePath<DecorableClass>;

  processDecorator(decorator, [klass], options);
};

export default processClassDecorator;
