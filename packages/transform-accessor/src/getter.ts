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
  DecoratorImplementation,
  generateAccessorInterceptor,
} from './utils';

export const _getter: DecoratorImplementation = (
  klass,
  member,
  get,
  storage,
): ClassMethod | ClassPrivateMethod => {
  const getId = generateAccessorInterceptor(klass, get, 'get');

  const value = memberExpression(thisExpression(), storage);

  const body = blockStatement([
    returnStatement(getId ? callExpression(getId, [value]) : value),
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

const getter = (get?: AccessorInterceptor): PropertyDecorator =>
  createAccessorDecorator(
    'getter',
    (get as unknown) as NodePath<AccessorInterceptorNode> | undefined,
    _getter,
  ) as any;

export default getter;
