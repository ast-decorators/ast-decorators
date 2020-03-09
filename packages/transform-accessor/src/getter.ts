import {NodePath} from '@babel/core';
import {
  blockStatement,
  callExpression,
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
  createAccessorDecorator,
  AccessorMethodCreator,
  generateAccessorInterceptor,
} from './utils';

export const createGetterMethod: AccessorMethodCreator = (
  klass,
  member,
  interceptor,
  storageProperty,
): ClassMethod | ClassPrivateMethod => {
  const interceptorId = generateAccessorInterceptor(klass, interceptor, 'get');
  const value = memberExpression(thisExpression(), storageProperty);

  const body = blockStatement([
    returnStatement(
      interceptorId ? callExpression(interceptorId, [value]) : value,
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
