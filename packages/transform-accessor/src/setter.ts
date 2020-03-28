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
  Decorator,
  expressionStatement,
  Identifier,
  isClassPrivateProperty,
  memberExpression,
  NumericLiteral,
  PrivateName,
  StringLiteral,
} from '@babel/types';
import {
  AccessorInterceptorNode,
  AccessorMethodCreator,
  createAccessorDecorator,
  ownerNode,
  injectInterceptor,
} from './utils/misc';

export const createSetterMethod: AccessorMethodCreator = (
  klass,
  member,
  interceptor,
  storageProperty,
  {preservingDecorators, useClassName, useContext},
): ClassMemberMethod => {
  const classBody = klass.get('body') as NodePath<ClassBody>;
  const valueId = classBody.scope.generateUidIdentifier('value');

  const body = blockStatement([
    expressionStatement(
      assignmentExpression(
        '=',
        memberExpression(ownerNode(klass, useClassName), storageProperty),
        interceptor
          ? injectInterceptor(
              klass,
              interceptor.node,
              valueId,
              'set',
              useContext,
              useClassName,
            )
          : valueId,
      ),
    ),
  ]);

  // @ts-ignore
  const {computed, key, static: _static} = member.node;

  const method = isClassPrivateProperty(member)
    ? classPrivateMethod('set', key as PrivateName, [valueId], body, _static)
    : classMethod(
        'set',
        key as Identifier | StringLiteral | NumericLiteral,
        [valueId],
        body,
        computed,
        _static,
      );

  method.decorators = preservingDecorators as Decorator[];

  return method;
};

const setter: ASTClassMemberCallableDecorator = (
  set?: NodePath<AccessorInterceptorNode>,
) => createAccessorDecorator('setter', set, createSetterMethod);

export default setter;
