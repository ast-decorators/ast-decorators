import type {
  ASTCallableDecorator,
  ClassMember,
  ClassMemberMethod,
  ClassMemberProperty,
  PrivacyType,
} from '@ast-decorators/utils/lib/common';
import createPropertyByPrivacy from '@ast-decorators/utils/lib/createPropertyByPrivacy';
import getMemberName from '@ast-decorators/utils/lib/getMemberName';
import hoistFunctionParameter from '@ast-decorators/utils/lib/hoistFunctionParameter';
import {cloneClassMember} from '@ast-decorators/utils/lib/babelFixes';
import template from '@babel/template';
import type {NodePath} from '@babel/traverse';
import {
  ArgumentPlaceholder,
  blockStatement,
  CallExpression,
  callExpression,
  Class,
  Expression,
  FunctionDeclaration,
  functionExpression,
  identifier,
  Identifier,
  isClassMethod,
  isClassPrivateMethod,
  JSXNamespacedName,
  MemberExpression,
  memberExpression,
  PrivateName,
  restElement,
  returnStatement,
  SpreadElement,
  thisExpression,
  VariableDeclaration,
} from '@babel/types';
import {AllowedWrappers, assertWrap, TransformWrapOptions} from './utils';

const STATIC_MIRROR_KEY = 'key:wrapper-static-mirror';

type StaticMirror = readonly [Identifier | PrivateName, ClassMemberProperty];

const findExistingReplacer = (
  klass: NodePath<Class>,
  member: NodePath<ClassMember>,
): NodePath<ClassMemberProperty> | undefined => {
  const replacerId = member.getData(STATIC_MIRROR_KEY);

  return replacerId
    ? ((klass.get('body.body') as ReadonlyArray<NodePath<ClassMember>>).find(
        ({node}: NodePath<ClassMember>) => getMemberName(node) === replacerId,
      ) as NodePath<ClassMemberProperty>)
    : undefined;
};

const prepareStaticMirror = (
  klass: NodePath<Class>,
  member: ClassMemberMethod,
  wrapperId: Identifier | MemberExpression,
  args: CallExpression['arguments'],
  privacy: PrivacyType = 'hard',
): StaticMirror => {
  const {async, body, generator, params} = member;

  const declaration = createPropertyByPrivacy(
    privacy,
    getMemberName(member),
    klass,
    {
      static: true,
      value: callExpression(wrapperId, [
        functionExpression(
          identifier(getMemberName(member)?.toString() ?? 'wrap'),
          params,
          body,
          generator,
          async,
        ),
        ...args,
      ]),
    },
  );

  return [declaration.key as Identifier | PrivateName, declaration];
};

const addNewWrapperToStaticMirror = (
  declaration: ClassMemberProperty,
  wrapperId: Identifier | MemberExpression,
  args: CallExpression['arguments'],
): StaticMirror => {
  const newDeclaration = cloneClassMember(declaration);

  newDeclaration.value = callExpression(wrapperId, [
    declaration.value!,
    ...args,
  ]);

  return [declaration.key as Identifier | PrivateName, newDeclaration];
};

const constructorProperty = template.expression('this.constructor.KEY');

const prepareMethodReplacement = (
  member: ClassMemberMethod,
  hoistedMethodId: Identifier | PrivateName,
): ClassMemberMethod => {
  const methodArgs = identifier('args');
  const params = [restElement(methodArgs)];
  const body = blockStatement([
    returnStatement(
      callExpression(
        memberExpression(
          constructorProperty({KEY: hoistedMethodId}),
          identifier('apply'),
        ),
        [thisExpression(), methodArgs],
      ),
    ),
  ]);

  const method = cloneClassMember(member);
  method.params = params;
  method.body = body;
  method.generator = false;

  return method;
};

const preparePropertyReplacement = (
  member: ClassMemberProperty,
  wrapperId: Identifier | MemberExpression,
  args: CallExpression['arguments'],
): ClassMemberProperty => {
  const wrappedValue = callExpression(wrapperId, [member.value!, ...args]);

  const property = cloneClassMember(member);
  property.value = wrappedValue;

  return property;
};

export const wrap = (
  klass: NodePath<Class>,
  member: NodePath<ClassMember>,
  wrapper: AllowedWrappers,
  args: CallExpression['arguments'],
  existingReplacer?: ClassMemberProperty,
  privacy?: PrivacyType,
): readonly [
  ClassMember,
  ClassMemberProperty?,
  (FunctionDeclaration | VariableDeclaration)?,
] => {
  const [wrapperId, wrapperFunctionDeclaration] = hoistFunctionParameter(
    wrapper,
    'wrap',
    klass.parentPath.scope,
  );

  if (isClassMethod(member.node) || isClassPrivateMethod(member.node)) {
    const [methodId, methodDeclaration] = existingReplacer
      ? addNewWrapperToStaticMirror(existingReplacer, wrapperId, args)
      : prepareStaticMirror(klass, member.node, wrapperId, args, privacy);

    return [
      prepareMethodReplacement(member.node, methodId),
      methodDeclaration,
      wrapperFunctionDeclaration,
    ];
  }

  const property = preparePropertyReplacement(member.node, wrapperId, args);

  return [property, undefined, wrapperFunctionDeclaration];
};

export const wrapTransformer: ASTCallableDecorator<
  [
    NodePath<AllowedWrappers>,
    ...ReadonlyArray<
      NodePath<
        Expression | SpreadElement | JSXNamespacedName | ArgumentPlaceholder
      >
    >
  ],
  TransformWrapOptions
> = (wrapper, ...args) => ({klass, member}, options) => {
  assertWrap(member?.node);

  const existingReplacer = findExistingReplacer(klass, member!);

  const [replacement, replacerMethod, wrapperFunctionDeclaration] = wrap(
    klass,
    member!,
    wrapper.node,
    args.map(({node}) => node),
    existingReplacer?.node,
    options?.privacy,
  );

  if (wrapperFunctionDeclaration) {
    klass.insertBefore(wrapperFunctionDeclaration);
  }

  if (replacerMethod) {
    if (existingReplacer) {
      existingReplacer.replaceWith(replacerMethod);
    } else {
      member!.insertBefore(replacerMethod);
    }

    member!.setData(STATIC_MIRROR_KEY, getMemberName(replacerMethod));
  }

  member!.replaceWith(replacement);
};
