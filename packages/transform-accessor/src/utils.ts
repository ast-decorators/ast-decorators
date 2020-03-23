import {
  ASTClassMemberDecorator,
  DecorableClass,
  PrivacyType,
} from '@ast-decorators/typings';
import {DecoratorSuitabilityFactors} from '@ast-decorators/utils/lib/checkDecoratorSuitability';
import createPropertyByPrivacy
  from '@ast-decorators/utils/lib/createPropertyByPrivacy';
import getMemberName from '@ast-decorators/utils/lib/getMemberName';
import {NodePath, template} from '@babel/core';
import {
  ArrowFunctionExpression,
  callExpression,
  CallExpression,
  ClassMethod,
  ClassPrivateMethod,
  ClassPrivateProperty,
  ClassProperty,
  Decorator,
  functionDeclaration,
  FunctionExpression,
  identifier,
  Identifier,
  isArrowFunctionExpression,
  isClassPrivateProperty,
  isClassProperty,
  isFunctionExpression,
  isIdentifier,
  memberExpression,
  MemberExpression,
  PrivateName,
  thisExpression,
} from '@babel/types';

export type TransformAccessorOptions = Readonly<{
  transformerPath?: string;
  singleAccessorDecorators?: DecoratorSuitabilityFactors;
  privacy?: PrivacyType;
}>;

export type AccessorAllowedMember = ClassProperty | ClassPrivateProperty;
export type AccessorInterceptor = (value: any) => any;
export type AccessorInterceptorNode =
  | FunctionExpression
  | ArrowFunctionExpression
  | Identifier;

export type AccessorMethodCreatorOptions = Readonly<{
  allowThisContext: boolean;
  preservingDecorators: Decorator[] | null;
}>;

export type AccessorMethodCreator = (
  klass: NodePath<DecorableClass>,
  member: NodePath<AccessorAllowedMember>,
  accessor: NodePath<AccessorInterceptorNode> | undefined,
  storage: Identifier | PrivateName,
  options: AccessorMethodCreatorOptions,
) => ClassMethod | ClassPrivateMethod;

export const assert = (
  decorator: string,
  member: NodePath<AccessorAllowedMember>,
  accessors: ReadonlyArray<NodePath<AccessorInterceptorNode> | undefined>,
): void => {
  if (!isClassProperty(member) && !isClassPrivateProperty(member)) {
    throw new Error(
      `Applying @${decorator} decorator to something other than property is not allowed`,
    );
  }

  for (const accessor of accessors) {
    if (
      accessor &&
      !isFunctionExpression(accessor) &&
      !isArrowFunctionExpression(accessor) &&
      !isIdentifier(accessor)
    ) {
      throw new Error(
        'Accessor interceptor can only be function or a variable identifier',
      );
    }
  }
};

export const createStorage = (
  klass: NodePath<DecorableClass>,
  member: NodePath<AccessorAllowedMember>,
  privacy: PrivacyType = 'hard',
): AccessorAllowedMember =>
  createPropertyByPrivacy(
    privacy,
    String(getMemberName(member.node)),
    member.node.value,
    klass,
  );

const declarator = template(`const VAR = FUNCTION`);

export const generateInterceptor = (
  klass: NodePath<DecorableClass>,
  interceptor: AccessorInterceptorNode,
  type: 'get' | 'set',
): Identifier => {
  const isArrow = isArrowFunctionExpression(interceptor);
  const isRegular = isFunctionExpression(interceptor);

  const accessorId =
    isArrow || isRegular
      ? klass.parentPath.scope.generateUidIdentifier(`${type}Interceptor`)
      : (interceptor as Identifier);

  if (isArrow) {
    klass.insertBefore(
      declarator({
        FUNCTION: interceptor,
        VAR: accessorId,
      }),
    );
  } else if (isRegular) {
    klass.insertBefore(
      functionDeclaration(
        accessorId,
        (interceptor as FunctionExpression).params,
        (interceptor as FunctionExpression).body,
      ),
    );
  }

  return accessorId;
};

export const createAccessorDecorator = (
  decorator: string,
  accessor: NodePath<AccessorInterceptorNode> | undefined,
  impl: AccessorMethodCreator,
): ASTClassMemberDecorator<TransformAccessorOptions> => (
  klass: NodePath<DecorableClass>,
  member: NodePath<AccessorAllowedMember>,
  {privacy}: TransformAccessorOptions = {},
): void => {
  assert(decorator, member, [accessor]);

  const storage = createStorage(klass, member, privacy);

  const method = impl(
    klass,
    member,
    accessor,
    storage.key as Identifier | PrivateName,
    {
      // TODO: Add option to set up context
      allowThisContext: true,
      preservingDecorators: member.node.decorators,
    },
  );

  member.replaceWithMultiple([storage, method]);
};

export const injectInterceptor = (
  klass: NodePath<DecorableClass>,
  interceptor: AccessorInterceptorNode,
  value: MemberExpression | Identifier,
  type: 'get' | 'set',
  allowThisContext: boolean,
): CallExpression => {
  const interceptorId = generateInterceptor(klass, interceptor, type);

  return isArrowFunctionExpression(interceptor) ||
    (isIdentifier(interceptor) && !allowThisContext)
    ? callExpression(interceptorId, [value])
    : callExpression(memberExpression(interceptorId, identifier('call')), [
        thisExpression(),
        value,
      ]);
};
