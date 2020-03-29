import {ClassMember, PluginPass} from '@ast-decorators/utils/lib/common';
import {NodePath} from '@babel/core';
import {
  Class,
  Decorator,
  isClassDeclaration,
  isClassExpression,
} from '@babel/types';
import processDecorator from './processor';
import {TransformerMap} from './utils';

const processClassMemberDecorator = (
  decorator: NodePath<Decorator>,
  transformerMap: TransformerMap,
  options: PluginPass,
): void => {
  const member = decorator.parentPath as NodePath<ClassMember>;

  const klass = member.findParent(
    path => isClassDeclaration(path) || isClassExpression(path),
  ) as NodePath<Class>;

  processDecorator(decorator, [klass, member], transformerMap, options);
};

export default processClassMemberDecorator;
