import type {
  ASTSimpleDecorator,
  ClassMember,
  ClassMemberMethod,
} from '@ast-decorators/utils/lib/common';
import {Scope} from '@babel/traverse';
import {
  CallExpression,
  callExpression,
  ClassMethod,
  classPrivateMethod,
  ClassPrivateMethod,
  classPrivateProperty,
  classProperty,
  Expression,
  identifier,
  isPrivate,
  memberExpression,
  privateName,
  PrivateName,
  thisExpression,
} from '@babel/types';
import {assertBind, TransformBindOptions} from './utils';

export type BoundNodes = [ClassMember, ClassMemberMethod];

const createBindingExpression = (
  key: Expression | PrivateName,
): CallExpression =>
  callExpression(
    memberExpression(
      memberExpression(thisExpression(), key),
      identifier('bind'),
    ),
    [thisExpression()],
  );

const bindPrivate = (method: ClassPrivateMethod, scope: Scope): BoundNodes => {
  const {
    async,
    body,
    decorators,
    generator,
    key,
    params,
    static: _static,
  } = method;

  const replacementKey = privateName(scope.generateUidIdentifier(key.id.name));

  const replacementNode = classPrivateProperty(
    key,
    createBindingExpression(replacementKey),
  );

  // @ts-expect-error: "static" is not listed in d.ts
  replacementNode.static = _static;

  const replacementMethod = classPrivateMethod(
    'method',
    replacementKey,
    params,
    body,
    _static,
  );

  replacementMethod.async = async;
  replacementMethod.generator = generator;
  replacementMethod.decorators = decorators;

  return [replacementNode, replacementMethod];
};

const bindRegular = (method: ClassMethod): BoundNodes => {
  const {computed, key, static: _static} = method;

  return [
    classProperty(
      key,
      createBindingExpression(key),
      null,
      null,
      computed,
      _static,
    ),
    method,
  ];
};

export const bind = (method: ClassMemberMethod, scope: Scope): BoundNodes =>
  isPrivate(method) ? bindPrivate(method, scope) : bindRegular(method);

export const bindTransformer: ASTSimpleDecorator<
  TransformBindOptions,
  ClassMemberMethod
> = ({klass, member}) => {
  assertBind(member!.node);

  const replacement = bind(member!.node, klass.scope);

  member!.replaceWithMultiple(replacement);
};
