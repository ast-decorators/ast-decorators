import type {
  ASTCallableDecorator,
  ClassMemberProperty,
} from '@ast-decorators/utils/lib/common';
import type {NodePath} from '@babel/traverse';
import {
  blockStatement,
  CallExpression,
  classMethod,
  classPrivateMethod,
  Decorator,
  FunctionDeclaration,
  Identifier,
  isClassPrivateProperty,
  MemberExpression,
  memberExpression,
  NumericLiteral,
  PrivateName,
  returnStatement,
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

export const getter: AccessorMethodCreator = (
  klass,
  member,
  interceptor,
  storageProperty,
  {preservingDecorators, useClassName, useContext},
) => {
  const value = memberExpression(
    ownerNode(klass.node, useClassName),
    storageProperty,
  );

  let statement: CallExpression | MemberExpression;
  let declarations: Array<FunctionDeclaration | VariableDeclaration>;

  if (interceptor) {
    [statement, declarations] = prepareInterceptor(
      klass,
      interceptor.node,
      value,
      'get',
      useContext,
      useClassName,
    );
  } else {
    statement = value;
    declarations = [];
  }

  const body = blockStatement([returnStatement(statement)]);

  // @ts-expect-error: "computed" do not exist on the ClassMemberProperty (it
  // will simply be undefined) and "static" is not listed in d.ts
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

  return [method, declarations];
};

export const getterTransformer: ASTCallableDecorator<
  [NodePath<AccessorInterceptorNode>?],
  TransformAccessorOptions,
  ClassMemberProperty
> = get => createAccessorDecorator('getter', get, getter);
