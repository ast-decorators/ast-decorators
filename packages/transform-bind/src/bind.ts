import type {
  ASTClassMemberDecorator,
  ClassMember,
  ClassMemberMethod,
} from '@ast-decorators/utils/lib/common';
import type {Scope} from '@babel/traverse';
import {
  arrowFunctionExpression,
  callExpression,
  ClassMethod,
  ClassPrivateMethod,
  classPrivateProperty,
  classProperty,
  FunctionDeclaration,
  functionDeclaration,
  identifier,
  isPrivate,
  memberExpression,
  thisExpression,
} from '@babel/types';
import {assert, TransformBindOptions} from './utils';

export type BoundNodes = readonly [
  ClassMember | ClassMember[],
  FunctionDeclaration?,
];

const bindPrivate = (method: ClassPrivateMethod, scope: Scope): BoundNodes => {
  const {async, body, decorators, generator, key, params} = method;

  if (generator) {
    const functionId = scope.generateUidIdentifier(key.id.name);

    return [
      classPrivateProperty(
        key,
        callExpression(memberExpression(functionId, identifier('bind')), [
          thisExpression(),
        ]),
        decorators,
      ),
      functionDeclaration(functionId, params, body, generator, async),
    ];
  }

  return [
    classPrivateProperty(
      key,
      arrowFunctionExpression(params, body, async),
      decorators,
    ),
  ];
};

const bindRegular = (method: ClassMethod): BoundNodes => {
  const {computed, decorators, key, static: _static} = method;

  const bindingExpression = callExpression(
    memberExpression(
      memberExpression(thisExpression(), key),
      identifier('bind'),
    ),
    [thisExpression()],
  );

  return [
    [
      classProperty(
        key,
        bindingExpression,
        null,
        decorators,
        computed,
        _static,
      ),
      method,
    ],
  ];
};

export const bind = (method: ClassMemberMethod, scope: Scope): BoundNodes =>
  isPrivate(method) ? bindPrivate(method, scope) : bindRegular(method);

export const bindTransformer: ASTClassMemberDecorator<
  TransformBindOptions,
  ClassMemberMethod
> = (klass, member) => {
  assert('bind', member.node);

  const [replacement, declaration] = bind(member.node, klass.scope);

  if (declaration) {
    klass.insertBefore(declaration);
  }

  if (Array.isArray(replacement)) {
    member.replaceWithMultiple(replacement);
  } else {
    member.replaceWith(replacement);
  }
};
