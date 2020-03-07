import {NodePath} from '@babel/core';
import {Decorator} from '@babel/types';
import processDecorator, {DecoratorProcessorOptions} from './processor';
import {DecorableClass} from './utils';

const processClassDecorator = (
  decorator: NodePath<Decorator>,
  options: DecoratorProcessorOptions,
): void => {
  const klass = decorator.parentPath as NodePath<DecorableClass>;

  processDecorator(decorator, [klass], options);
};

export default processClassDecorator;
