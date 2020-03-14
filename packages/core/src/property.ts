import {
  ASTDecoratorTransformerOptions,
  DecorableClass,
  DecorableClassMember,
  PluginPass,
} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {Decorator, isClassDeclaration, isClassExpression} from '@babel/types';
import processDecorator from './processor';

const processClassMemberDecorator = (
  decorator: NodePath<Decorator>,
  options: PluginPass<ASTDecoratorTransformerOptions>,
): void => {
  const member = decorator.parentPath as NodePath<DecorableClassMember>;

  const klass = member.findParent(
    path => isClassDeclaration(path) || isClassExpression(path),
  ) as NodePath<DecorableClass>;

  processDecorator(decorator, [klass, member], options);
};

export default processClassMemberDecorator;
