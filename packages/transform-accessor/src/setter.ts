import {NodePath} from '@babel/core';
import {
  assignmentExpression,
  blockStatement,
  ClassBody,
  classMethod,
  ClassMethod,
  classPrivateMethod,
  ClassPrivateMethod,
  ClassProperty,
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
  {allowThisContext, preserveDecorators},
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

  const method = isClassPrivateProperty(member)
    ? classPrivateMethod('set', member.node.key as PrivateName, [valueId], body)
    : classMethod(
        'set',
        member.node.key as Identifier | StringLiteral | NumericLiteral,
        [valueId],
        body,
        (member.node as ClassProperty).computed,
      );

  if (preserveDecorators) {
    method.decorators = member.node.decorators;
  }

  return method;
};

export type SetterDecorator = (set?: AccessorInterceptor) => PropertyDecorator;

const setter: SetterDecorator = ((set?: NodePath<AccessorInterceptorNode>) =>
  createAccessorDecorator('setter', set, createSetterMethod)) as any;

export default setter;
