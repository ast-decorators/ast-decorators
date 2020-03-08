import {DecorableClass, DecorableClassMember} from '@ast-decorators/typings';
import {NodePath, template} from '@babel/core';
import {
  ArrowFunctionExpression,
  ClassPrivateProperty,
  ClassProperty,
  FunctionExpression,
  Identifier,
  isArrowFunctionExpression,
  isClassMethod,
  isClassPrivateProperty,
  isClassProperty,
  isFunctionExpression,
  isIdentifier,
  isNumericLiteral,
  isStringLiteral,
  privateName,
  ClassBody,
  PrivateName,
  ClassMethod,
  ClassPrivateMethod,
} from '@babel/types';
import {_getter} from './getter';

export type AccessorAllowedMember = ClassProperty | ClassPrivateProperty;

export type AccessorInterceptor = (value: any) => any;

export type AccessorInterseptorNode =
  | FunctionExpression
  | ArrowFunctionExpression
  | Identifier;

export type DecoratorImplementation = (
  klass: NodePath<DecorableClass>,
  member: NodePath<DecorableClassMember>,
  accessor: NodePath<AccessorInterseptorNode> | undefined,
  storage: PrivateName,
) => ClassMethod | ClassPrivateMethod;

export type AccessorOptions = {
  execute?: boolean;
};

export const assert = (
  decorator: string,
  member: NodePath<DecorableClassMember>,
): void => {
  if (!isClassProperty(member) && !isClassPrivateProperty(member)) {
    throw new Error(
      `Applying @${decorator} decorator to something other than property is` +
        ' not allowed',
    );
  }
};

export const getKeyName = (node: DecorableClassMember): string | undefined => {
  if (isClassProperty(node) || isClassMethod(node)) {
    return isIdentifier(node.key)
      ? node.key.name
      : isStringLiteral(node.key) || isNumericLiteral(node.key)
      ? String(node.key.value)
      : undefined;
  }

  return node.key.id.name;
};

export const createStorage = (
  klass: NodePath<DecorableClass>,
  member: NodePath<AccessorAllowedMember>,
): PrivateName =>
  privateName(
    (klass.get('body') as NodePath<ClassBody>).scope.generateUidIdentifier(
      getKeyName(member.node),
    ),
  );

const declarator = template(`const VAR = FUNCTION`);

export const generateAccessorInterceptor = (
  klass: NodePath<DecorableClass>,
  accessor: NodePath<AccessorInterseptorNode> | undefined,
): Identifier | undefined => {
  if (!accessor) {
    return undefined;
  }

  let accessorId: Identifier;

  if (isFunctionExpression(accessor) || isArrowFunctionExpression(accessor)) {
    accessorId = klass.parentPath.scope.generateUidIdentifier();
    klass.insertBefore(
      declarator({
        FUNCTION: accessor,
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
  accessor: NodePath<AccessorInterseptorNode> | undefined,
  impl: DecoratorImplementation,
) => (
  klass: NodePath<DecorableClass>,
  member: NodePath<DecorableClassMember>,
): void => {
  assert(decorator, member);

  const storage = createStorage(
    klass,
    member as NodePath<AccessorAllowedMember>,
  );

  const method = impl(
    klass,
    member as NodePath<AccessorAllowedMember>,
    accessor,
    storage,
  );

  member.replaceWithMultiple([storage, method]);
};
