import {NodePath} from '@babel/core';
import {
  blockStatement,
  classMethod,
  ClassMethod,
  classPrivateMethod,
  ClassPrivateMethod,
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
  allowThisContext,
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

  if (isClassPrivateProperty(member)) {
    return classPrivateMethod('get', member.node.key as PrivateName, [], body);
  }

  return classMethod(
    'get',
    member.node.key as Identifier | StringLiteral | NumericLiteral,
    [],
    body,
  );
};

export type GetterDecorator = (get?: AccessorInterceptor) => PropertyDecorator;

const getter: GetterDecorator = ((get?: NodePath<AccessorInterceptorNode>) =>
  createAccessorDecorator('getter', get, createGetterMethod)) as any;

export default getter;
