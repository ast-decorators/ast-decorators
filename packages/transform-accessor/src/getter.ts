import {NodePath} from '@babel/core';
import {
  blockStatement,
  classMethod,
  ClassMethod,
  classPrivateMethod,
  ClassPrivateMethod,
  ClassProperty,
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
  AccessorInterceptor,
  AccessorInterceptorNode,
  AccessorMethodCreator,
  createAccessorDecorator,
  injectInterceptor,
} from './utils';

export const createGetterMethod: AccessorMethodCreator = (
  klass,
  member,
  interceptor,
  storageProperty,
  {allowThisContext, preserveDecorators},
): ClassMethod | ClassPrivateMethod => {
  const value = memberExpression(thisExpression(), storageProperty);

  const body = blockStatement([
    returnStatement(
      interceptor
        ? injectInterceptor(
            klass,
            interceptor.node,
            value,
            'get',
            allowThisContext,
          )
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

  if (preserveDecorators) {
    method.decorators = member.node.decorators;
  }

  return method;
};

export type GetterDecorator = (get?: AccessorInterceptor) => PropertyDecorator;

const getter: GetterDecorator = ((get?: NodePath<AccessorInterceptorNode>) =>
  createAccessorDecorator('getter', get, createGetterMethod)) as any;

export default getter;
