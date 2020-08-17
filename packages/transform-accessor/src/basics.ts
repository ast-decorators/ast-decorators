import {
  classMethod,
  classPrivateMethod,
  cloneNode,
} from '@ast-decorators/utils/lib/babelFixes';
import {ClassMember, ClassMemberMethod} from '@ast-decorators/utils/src/common';
import {NodePath} from '@babel/traverse';
import {
  assignmentExpression,
  blockStatement,
  Class,
  expressionStatement,
  identifier,
  Identifier,
  isMethod,
  isPrivate,
  memberExpression,
  NumericLiteral,
  PrivateName,
  returnStatement,
  StringLiteral,
} from '@babel/types';
import {AccessorMethodCreatorOptions, ownerNode} from './utils';

export const basicGetter = (
  klass: NodePath<Class>,
  member: NodePath<ClassMember>,
  storageProperty: Identifier | PrivateName | undefined,
  {preservingDecorators, useClassName}: AccessorMethodCreatorOptions,
): ClassMemberMethod => {
  if (isMethod(member.node)) {
    const method = cloneNode(member.node);
    method.decorators = preservingDecorators;

    return method;
  }

  const body = blockStatement([
    returnStatement(
      memberExpression(ownerNode(klass.node, useClassName), storageProperty!),
    ),
  ]);

  // @ts-expect-error: "computed" do not exist on the ClassPrivateProperty (it
  // will simply be undefined) and "static" is not listed in d.ts
  const {computed, key, static: _static} = member.node;

  return isPrivate(member)
    ? classPrivateMethod(
        'get',
        key as PrivateName,
        [],
        body,
        preservingDecorators,
        _static,
      )
    : classMethod(
        'get',
        key as Identifier | StringLiteral | NumericLiteral,
        [],
        body,
        preservingDecorators,
        computed,
        _static,
      );
};

export const basicSetter = (
  klass: NodePath<Class>,
  member: NodePath<ClassMember>,
  storageProperty: Identifier | PrivateName | undefined,
  {preservingDecorators, useClassName}: AccessorMethodCreatorOptions,
): ClassMemberMethod => {
  if (isMethod(member.node)) {
    const method = cloneNode(member.node);
    method.decorators = preservingDecorators;

    return method;
  }

  const valueId = identifier('value');
  const params = [valueId];

  const property = memberExpression(
    ownerNode(klass.node, useClassName),
    storageProperty!,
  );

  const body = blockStatement([
    expressionStatement(assignmentExpression('=', property, valueId)),
  ]);

  // @ts-expect-error: "computed" do not exist on the ClassPrivateProperty (it
  // will simply be undefined) and "static" is not listed in d.ts
  const {computed, key, static: _static} = member.node;

  return isPrivate(member)
    ? classPrivateMethod(
        'set',
        key as PrivateName,
        params,
        body,
        preservingDecorators,
        _static,
      )
    : classMethod(
        'set',
        key as Identifier | StringLiteral | NumericLiteral,
        params,
        body,
        preservingDecorators,
        computed,
        _static,
      );
};
