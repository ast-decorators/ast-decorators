import type {
  ASTCallableDecorator,
  ClassMemberProperty,
} from '@ast-decorators/utils/lib/common';
import type {NodePath} from '@babel/traverse';
import {
  assignmentExpression,
  blockStatement,
  CallExpression,
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
  TransformAccessorOptions,
} from './utils';

export const setter: AccessorMethodCreator = (
  klass,
  member,
  interceptor,
  storageProperty,
  {preservingDecorators, useClassName, useContext},
) => {
  const classBody = klass.get('body');
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
        memberExpression(ownerNode(klass.node, useClassName), storageProperty),
        statement,
      ),
    ),
  ]);

  // @ts-expect-error: "computed" do not exist on the ClassMemberProperty (it
  // will simply be undefined) and "static" is not listed in d.ts
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

export const setterTransformer: ASTCallableDecorator<
  [NodePath<AccessorInterceptorNode>?],
  TransformAccessorOptions,
  ClassMemberProperty
> = set => createAccessorDecorator('setter', set, setter);
