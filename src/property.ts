import {NodePath} from '@babel/core';
import {Decorator, isClassDeclaration, isClassExpression} from '@babel/types';
import processDecorator, {DecoratorProcessorOptions} from './processor';
import {DecorableClass, DecorableClassMember} from './utils';

const processClassPropertyOrMethodDecorator = (
  decorator: NodePath<Decorator>,
  options: DecoratorProcessorOptions,
): void => {
  const propertyOrMethod = decorator.parentPath as NodePath<
    DecorableClassMember
  >;

  const klass = propertyOrMethod.findParent(
    path => isClassDeclaration(path) || isClassExpression(path),
  ) as NodePath<DecorableClass>;

  processDecorator(decorator, [klass, propertyOrMethod], options);
};

export default processClassPropertyOrMethodDecorator;
