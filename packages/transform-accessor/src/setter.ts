import {NodePath} from '@babel/core';
import {
  assignmentExpression,
  blockStatement,
  ClassBody,
  classMethod,
  ClassMethod,
  classPrivateMethod,
  ClassPrivateMethod,
  expressionStatement,
  Identifier,
  isClassPrivateProperty,
  memberExpression,
  NumericLiteral,
  PrivateName,
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

export const createSetterMethod: AccessorMethodCreator = (
  klass,
  member,
  interceptor,
  storageProperty,
  allowThisContext,
): ClassMethod | ClassPrivateMethod => {
  const classBody = klass.get('body') as NodePath<ClassBody>;
  const valueId = classBody.scope.generateUidIdentifier('value');

  const body = blockStatement([
    expressionStatement(
      assignmentExpression(
        '=',
        memberExpression(thisExpression(), storageProperty),
        interceptor
          ? injectInterceptor(
              klass,
              interceptor.node,
              valueId,
              'set',
              allowThisContext,
            )
          : valueId,
      ),
    ),
  ]);

  if (isClassPrivateProperty(member)) {
    return classPrivateMethod(
      'set',
      member.node.key as PrivateName,
      [valueId],
      body,
    );
  }

  return classMethod(
    'set',
    member.node.key as Identifier | StringLiteral | NumericLiteral,
    [valueId],
    body,
  );
};

export type SetterDecorator = (set?: AccessorInterceptor) => PropertyDecorator;

const setter: SetterDecorator = ((set?: NodePath<AccessorInterceptorNode>) =>
  createAccessorDecorator('setter', set, createSetterMethod)) as any;

export default setter;
