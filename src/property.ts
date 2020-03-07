import {NodePath} from '@babel/core';
import {Decorator, isClassDeclaration, isClassExpression} from '@babel/types';
import processDecorator, {DecoratorProcessorOptions} from './processor';
import {DecorableClass, DecorableClassMember} from './utils';

const processClassMemberDecorator = (
  decorator: NodePath<Decorator>,
  options: DecoratorProcessorOptions,
): void => {
  const member = decorator.parentPath as NodePath<DecorableClassMember>;

  const klass = member.findParent(
    path => isClassDeclaration(path) || isClassExpression(path),
  ) as NodePath<DecorableClass>;

  processDecorator(decorator, [klass, member], options);
};

export default processClassMemberDecorator;
