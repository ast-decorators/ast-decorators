import {
  ASTClassMemberDecorator,
  ASTDecoratorPluginOptions,
  DecorableClass,
} from '@ast-decorators/typings';
import createPropertyByPrivacy from '@ast-decorators/utils/lib/createPropertyByPrivacy';
import getMemberName from '@ast-decorators/utils/lib/getMemberName';
import getOverridableOption from '@ast-decorators/utils/lib/getOverridableOption';
import {NodePath, template} from '@babel/core';
import {
  ArrowFunctionExpression,
  callExpression,
  CallExpression,
  ClassMethod,
  ClassPrivateMethod,
  ClassPrivateProperty,
  ClassProperty,
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

const PLUGIN_NAME = '@ast-decorators/transform-accessor';

export type AccessorAllowedMember = ClassProperty | ClassPrivateProperty;
export type AccessorInterceptor = (value: any) => any;
export type AccessorInterceptorNode =
  | FunctionExpression
  | ArrowFunctionExpression
  | Identifier;

export type AccessorMethodCreator = (
  klass: NodePath<DecorableClass>,
  member: NodePath<AccessorAllowedMember>,
  accessor: NodePath<AccessorInterceptorNode> | undefined,
  storage: Identifier | PrivateName,
  allowThisContext: boolean,
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
  options?: ASTDecoratorPluginOptions,
): AccessorAllowedMember => {
  const finalPrivacy = getOverridableOption(
    options,
    'privacy',
    PLUGIN_NAME,
    'hard',
  );

  return createPropertyByPrivacy(
    finalPrivacy,
    String(getMemberName(member.node)),
    member.node.value,
    klass,
  );
};

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
): ASTClassMemberDecorator => (
  klass: NodePath<DecorableClass>,
  member: NodePath<AccessorAllowedMember>,
  options?: ASTDecoratorPluginOptions,
): void => {
  assert(decorator, member, [accessor]);

  const storage = createStorage(klass, member, options);

  const method = impl(
    klass,
    member,
    accessor,
    storage.key as Identifier | PrivateName,
    // TODO: Add option to set up context
    true,
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

  return isArrowFunctionExpression(interceptor) || !allowThisContext
    ? callExpression(interceptorId, [value])
    : callExpression(memberExpression(interceptorId, identifier('call')), [
        thisExpression(),
        value,
      ]);
};
