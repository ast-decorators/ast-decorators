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
  ClassMethod,
  ClassPrivateMethod,
  ClassPrivateProperty,
  ClassProperty,
  FunctionExpression,
  Identifier,
  isArrowFunctionExpression,
  isClassPrivateProperty,
  isClassProperty,
  isFunctionExpression,
  isIdentifier,
  PrivateName,
} from '@babel/types';

const PLUGIN_NAME = '@ast-decorators/transform-accessor';

export type AccessorAllowedMember = ClassProperty | ClassPrivateProperty;

export type AccessorInterceptor = (value: any) => any;

export type AccessorInterceptorNode =
  | FunctionExpression
  | ArrowFunctionExpression
  | Identifier;

export type DecoratorImplementation = (
  klass: NodePath<DecorableClass>,
  member: NodePath<AccessorAllowedMember>,
  accessor: NodePath<AccessorInterceptorNode> | undefined,
  storage: Identifier | PrivateName,
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

export const generateAccessorInterceptor = (
  klass: NodePath<DecorableClass>,
  accessor: NodePath<AccessorInterceptorNode> | undefined,
  type: 'get' | 'set',
): Identifier | null => {
  if (!accessor) {
    return null;
  }

  let accessorId: Identifier;

  if (isFunctionExpression(accessor) || isArrowFunctionExpression(accessor)) {
    accessorId = klass.parentPath.scope.generateUidIdentifier(
      `${type}Interceptor`,
    );
    klass.insertBefore(
      declarator({
        FUNCTION: accessor.node,
        VAR: accessorId,
      }),
    );
  } else {
    accessorId = accessor.node as Identifier;
  }

  return accessorId;
};

export const createAccessorDecorator = (
  decorator: string,
  accessor: NodePath<AccessorInterceptorNode> | undefined,
  impl: DecoratorImplementation,
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
  );

  member.replaceWithMultiple([storage, method]);
};
