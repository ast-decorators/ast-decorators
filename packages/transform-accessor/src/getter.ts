import {
  ASTClassMemberCallableDecorator,
  ClassMemberMethod,
} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {
  blockStatement,
  classMethod,
  classPrivateMethod,
  ClassProperty,
  Decorator,
  Identifier,
  isClassPrivateProperty,
  memberExpression,
  NumericLiteral,
  PrivateName,
  returnStatement,
  StringLiteral,
  thisExpression,
} from '@babel/types';
import {
  AccessorInterceptorNode,
  AccessorMethodCreator,
  createAccessorDecorator,
  injectInterceptor,
} from './utils/misc';

export const createGetterMethod: AccessorMethodCreator = (
  klass,
  member,
  interceptor,
  storageProperty,
  {preservingDecorators, useContext},
): ClassMemberMethod => {
  const value = memberExpression(thisExpression(), storageProperty);

  const body = blockStatement([
    returnStatement(
      interceptor
        ? injectInterceptor(klass, interceptor.node, value, 'get', useContext)
        : value,
    ),
  ]);

  const method = isClassPrivateProperty(member)
    ? classPrivateMethod('get', member.node.key as PrivateName, [], body)
    : classMethod(
        'get',
        member.node.key as Identifier | StringLiteral | NumericLiteral,
        [],
        body,
        (member.node as ClassProperty).computed,
      );

  method.decorators = preservingDecorators as Decorator[];

  return method;
};

const getter: ASTClassMemberCallableDecorator = (
  get?: NodePath<AccessorInterceptorNode>,
) => createAccessorDecorator('getter', get, createGetterMethod);

export default getter;
