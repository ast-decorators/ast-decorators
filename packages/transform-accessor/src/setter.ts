import {NodePath} from '@babel/core';
import {
  assignmentExpression,
  blockStatement,
  callExpression,
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
  createAccessorDecorator,
  DecoratorImplementation,
  generateAccessorInterceptor,
} from './utils';

export const _setter: DecoratorImplementation = (
  klass,
  member,
  set,
  storage,
): ClassMethod | ClassPrivateMethod => {
  const setId = generateAccessorInterceptor(klass, set, 'set');

  const classBody = klass.get('body') as NodePath<ClassBody>;
  const valueId = classBody.scope.generateUidIdentifier('value');

  const body = blockStatement([
    expressionStatement(
      assignmentExpression(
        '=',
        memberExpression(thisExpression(), storage),
        setId ? callExpression(setId, [valueId]) : valueId,
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

const setter = (set?: AccessorInterceptor): PropertyDecorator =>
  createAccessorDecorator(
    'setter',
    (set as unknown) as NodePath<AccessorInterceptorNode> | undefined,
    _setter,
  ) as any;

export default setter;
