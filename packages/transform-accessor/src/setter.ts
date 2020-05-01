import {ASTClassMemberCallableDecorator} from '@ast-decorators/utils/lib/common';
import {NodePath} from '@babel/core';
import {
  assignmentExpression,
  blockStatement,
  CallExpression,
  ClassBody,
  classMethod,
  classPrivateMethod,
  Decorator,
  expressionStatement,
  FunctionDeclaration,
  Identifier,
  isClassPrivateProperty,
  memberExpression,
  NumericLiteral,
  PrivateName,
  StringLiteral,
  VariableDeclaration,
} from '@babel/types';
import {
  AccessorInterceptorNode,
  AccessorMethodCreator,
  createAccessorDecorator,
  ownerNode,
  prepareInterceptor,
} from './utils';

export const setter: AccessorMethodCreator = (
  klass,
  member,
  interceptor,
  storageProperty,
  {preservingDecorators, useClassName, useContext},
) => {
  const classBody = klass.get('body') as NodePath<ClassBody>;
  const valueId = classBody.scope.generateUidIdentifier('value');

  let statement: CallExpression | Identifier;
  let declarations: Array<FunctionDeclaration | VariableDeclaration>;

  if (interceptor) {
    [statement, declarations] = prepareInterceptor(
      klass,
      interceptor.node,
      valueId,
      'set',
      useContext,
      useClassName,
    );
  } else {
    statement = valueId;
    declarations = [];
  }

  const body = blockStatement([
    expressionStatement(
      assignmentExpression(
        '=',
        memberExpression(ownerNode(klass, useClassName), storageProperty),
        statement,
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

  return [method, declarations];
};

export const setterTransformer: ASTClassMemberCallableDecorator = (
  set?: NodePath<AccessorInterceptorNode>,
) => createAccessorDecorator('setter', set, setter);
