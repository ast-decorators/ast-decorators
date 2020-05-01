import ASTDecoratorsError from '@ast-decorators/utils/lib/ASTDecoratorsError';
import {
  ASTClassMemberCallableDecorator,
  ClassMember,
  ClassMemberMethod,
  ClassMemberProperty,
} from '@ast-decorators/utils/lib/common';
import getMemberName from '@ast-decorators/utils/lib/getMemberName';
import {NodePath} from '@babel/core';
import {Scope} from '@babel/traverse';
import {
  ArgumentPlaceholder,
  ArrowFunctionExpression,
  blockStatement,
  callExpression,
  ClassMethod,
  classMethod,
  classPrivateMethod,
  classPrivateProperty,
  ClassProperty,
  classProperty,
  Expression,
  functionDeclaration,
  FunctionDeclaration,
  functionExpression,
  FunctionExpression,
  identifier,
  Identifier,
  isClassMethod,
  isClassPrivateMethod,
  isClassPrivateProperty,
  isClassProperty,
  isFunctionExpression,
  isIdentifier,
  isLiteral,
  isPrivate,
  JSXNamespacedName,
  memberExpression,
  MemberExpression,
  PrivateName,
  restElement,
  returnStatement,
  SpreadElement,
  thisExpression,
  VariableDeclaration,
  variableDeclaration,
  variableDeclarator,
} from '@babel/types';
import {TransformBindOptions} from './utils';

const capitalize = (msg: string): string =>
  msg.charAt(0).toUpperCase() + msg.slice(1);

type PreparedNodes = readonly [
  Identifier,
  (FunctionDeclaration | VariableDeclaration)?,
];

export type DecoratedNodes = readonly [
  ClassMember,
  Array<FunctionDeclaration | VariableDeclaration>,
];

const prepareDecoratorFunction = (
  originalDecorator:
    | FunctionExpression
    | ArrowFunctionExpression
    | Identifier
    | MemberExpression,
  member: ClassMember,
  scope: Scope,
): PreparedNodes => {
  if (isIdentifier(originalDecorator)) {
    return [originalDecorator];
  }

  const uid = getMemberName(member)?.toString();

  const functionId = scope.generateUidIdentifier(
    uid ? `decorate${capitalize(uid)}` : undefined,
  );

  let declaration: VariableDeclaration | FunctionDeclaration;

  if (isFunctionExpression(originalDecorator)) {
    const {async, body, generator, params} = originalDecorator;

    declaration = functionDeclaration(
      functionId,
      params,
      body,
      generator,
      async,
    );
  } else {
    declaration = variableDeclaration('const', [
      variableDeclarator(functionId, originalDecorator),
    ]);
  }

  return [functionId, declaration];
};
const prepareDecoratedMethod = (
  member: ClassMemberMethod,
  decoratorId: Identifier,
  args: ReadonlyArray<
    Expression | SpreadElement | JSXNamespacedName | ArgumentPlaceholder
  >,
  scope: Scope,
): PreparedNodes => {
  const methodId = scope.generateUidIdentifier(
    getMemberName(member)?.toString(),
  );
  const {async, body, generator, params} = member;

  const declaration = variableDeclaration('const', [
    variableDeclarator(
      methodId,
      callExpression(decoratorId, [
        functionExpression(null, params, body, generator, async),
        ...args,
      ]),
    ),
  ]);

  return [methodId, declaration];
};

const prepareMethodReplacement = (
  member: ClassMemberMethod,
  hoistedMethodId: Identifier,
): ClassMemberMethod => {
  const {async, computed, decorators, generator, key, static: _static} = member;

  const methodArgs = identifier('args');
  const params = [restElement(methodArgs)];
  const body = blockStatement([
    returnStatement(
      callExpression(memberExpression(hoistedMethodId, identifier('apply')), [
        thisExpression(),
        methodArgs,
      ]),
    ),
  ]);

  let replacement: ClassMemberMethod;

  if (isClassPrivateMethod(member)) {
    replacement = classPrivateMethod(
      'method',
      key as PrivateName,
      params,
      body,
      _static,
    );
    replacement.async = async;
    replacement.generator = generator;
    replacement.decorators = decorators;
  } else {
    replacement = classMethod(
      'method',
      key as ClassMethod['key'],
      params,
      body,
      computed,
      _static,
      generator,
      async,
    );
    replacement.decorators = decorators;
  }

  return replacement;
};

const preparePropertyReplacement = (
  member: ClassMemberProperty,
  decoratorId: Identifier,
): ClassMemberProperty => {
  // @ts-ignore
  const {computed, decorators, key, static: _static, value} = member;

  const decoratedMember = callExpression(decoratorId, [value!]);

  let property: ClassMemberProperty;

  if (isPrivate(member)) {
    property = classPrivateProperty(
      key as PrivateName,
      decoratedMember,
      decorators,
    );

    // @ts-ignore
    property.static = _static;
  } else {
    property = classProperty(
      key as ClassProperty['key'],
      decoratedMember,
      null,
      decorators,
      computed,
      _static,
    );
  }

  return property;
};

export const decorate = (
  member: ClassMember,
  decorator:
    | FunctionExpression
    | ArrowFunctionExpression
    | Identifier
    | MemberExpression,
  args: ReadonlyArray<
    Expression | SpreadElement | JSXNamespacedName | ArgumentPlaceholder
  >,
  scope: Scope,
): DecoratedNodes => {
  const declarations: Array<FunctionDeclaration | VariableDeclaration> = [];

  const [decoratorId, decoratorDeclaration] = prepareDecoratorFunction(
    decorator,
    member,
    scope,
  );

  if (decoratorDeclaration) {
    declarations.push(decoratorDeclaration);
  }

  if (isClassMethod(member) || isClassPrivateMethod(member)) {
    const [methodId, methodDeclaration] = prepareDecoratedMethod(
      member,
      decoratorId,
      args,
      scope,
    );

    if (methodDeclaration) {
      declarations.push(methodDeclaration);
    }

    return [prepareMethodReplacement(member, methodId), declarations];
  }

  const property = preparePropertyReplacement(member, decoratorId);

  return [property, declarations];
};

export const decorateTransformer: ASTClassMemberCallableDecorator<
  [
    NodePath<
      | FunctionExpression
      | ArrowFunctionExpression
      | Identifier
      | MemberExpression
    >,
  ],
  TransformBindOptions
> = (decorator, ...args) => (klass, member) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!decorator) {
    const methodName = getMemberName(member.node);

    throw new ASTDecoratorsError(
      `No decorator function provided${
        methodName !== undefined ? ` for ${methodName}` : ''
      }`,
    );
  }

  if (
    (isClassProperty(member.node) || isClassPrivateProperty(member.node)) &&
    (!member.node.value || isLiteral(member.node.value))
  ) {
    throw new ASTDecoratorsError(
      '@decorate can only be applied to class methods or properties with ' +
        'functions assigned',
    );
  }

  const [replacement, declarations] = decorate(
    member.node,
    decorator.node,
    args.map(({node}) => node),
    klass.scope,
  );

  klass.insertBefore(declarations);
  member.replaceWith(replacement);
};
