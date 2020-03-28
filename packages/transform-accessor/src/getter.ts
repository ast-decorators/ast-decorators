import {
  ASTClassMemberCallableDecorator,
  ClassMemberMethod,
} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {
  blockStatement,
  classMethod,
  classPrivateMethod,
  Decorator,
  Identifier,
  isClassPrivateProperty,
  memberExpression,
  NumericLiteral,
  PrivateName,
  returnStatement,
  StringLiteral,
} from '@babel/types';
import {
  AccessorInterceptorNode,
  AccessorMethodCreator,
  createAccessorDecorator,
  injectInterceptor,
  ownerNode,
} from './utils/misc';

export const createGetterMethod: AccessorMethodCreator = (
  klass,
  member,
  interceptor,
  storageProperty,
  {preservingDecorators, useClassName, useContext},
): ClassMemberMethod => {
  const value = memberExpression(
    ownerNode(klass, useClassName),
    storageProperty,
  );

  const body = blockStatement([
    returnStatement(
      interceptor
        ? injectInterceptor(
            klass,
            interceptor.node,
            value,
            'get',
            useContext,
            useClassName,
          )
        : value,
    ),
  ]);

  // @ts-ignore
  const {computed, key, static: _static} = member.node;

  const method = isClassPrivateProperty(member)
    ? classPrivateMethod('get', key as PrivateName, [], body, _static)
    : classMethod(
        'get',
        key as Identifier | StringLiteral | NumericLiteral,
        [],
        body,
        computed,
        _static,
      );

  method.decorators = preservingDecorators as Decorator[];

  return method;
};

const getter: ASTClassMemberCallableDecorator = (
  get?: NodePath<AccessorInterceptorNode>,
) => createAccessorDecorator('getter', get, createGetterMethod);

export default getter;
