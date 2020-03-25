import {
  ASTClassMemberCallableDecorator,
  ClassMemberMethod,
} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {
  assignmentExpression,
  blockStatement,
  ClassBody,
  classMethod,
  classPrivateMethod,
  ClassProperty,
  Decorator,
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
  {allowThisContext, preservingDecorators},
): ClassMemberMethod => {
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

  method.decorators = preservingDecorators as Decorator[];

  return method;
};

const setter: ASTClassMemberCallableDecorator = (
  set?: NodePath<AccessorInterceptorNode>,
) => createAccessorDecorator('setter', set, createSetterMethod);

export default setter;
