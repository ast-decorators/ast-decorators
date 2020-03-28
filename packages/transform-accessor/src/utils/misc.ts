import {
  ASTClassMemberDecorator,
  ClassMemberMethod,
  ClassMemberProperty,
  PluginPass,
  PrivacyType,
} from '@ast-decorators/typings';
import ASTDecoratorsError from '@ast-decorators/utils/lib/ASTDecoratorsError';
import {SuitabilityFactors} from '@ast-decorators/utils/lib/checkSuitability';
import createPropertyByPrivacy from '@ast-decorators/utils/lib/createPropertyByPrivacy';
import getMemberName from '@ast-decorators/utils/lib/getMemberName';
import {NodePath, template} from '@babel/core';
import {
  ArrowFunctionExpression,
  callExpression,
  CallExpression,
  Class,
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
  isMemberExpression,
  memberExpression,
  MemberExpression,
  PrivateName,
  thisExpression,
} from '@babel/types';
import shouldUseContext from './context';

export type TransformAccessorOptions = Readonly<{
  interceptorContext?: InterceptorContext;
  privacy?: PrivacyType;
  singleAccessorDecorators?: SuitabilityFactors;
  transformerPath?: string;
}>;

export type AccessorInterceptor = (value: any) => any;
export type AccessorInterceptorNode =
  | FunctionExpression
  | ArrowFunctionExpression
  | Identifier
  | MemberExpression;

export type InterceptorContext = Readonly<{
  disableByDefault?: boolean;
  exclude?: SuitabilityFactors;
}>;

export type AccessorMethodCreatorOptions = Readonly<{
  useContext: boolean;
  preservingDecorators: Decorator[] | null;
}>;

export type AccessorMethodCreator = (
  klass: NodePath<Class>,
  member: NodePath<ClassMemberProperty>,
  accessor: NodePath<AccessorInterceptorNode> | undefined,
  storage: Identifier | PrivateName,
  options: AccessorMethodCreatorOptions,
) => ClassMemberMethod;

export const assert = (
  decorator: string,
  member: NodePath<ClassMemberProperty>,
  interceptors: ReadonlyArray<NodePath<AccessorInterceptorNode> | undefined>,
): void => {
  if (!isClassProperty(member) && !isClassPrivateProperty(member)) {
    throw new ASTDecoratorsError(
      `Applying @${decorator} decorator to something other than property is not allowed`,
    );
  }

  for (const interceptor of interceptors) {
    if (
      interceptor &&
      !isFunctionExpression(interceptor) &&
      !isArrowFunctionExpression(interceptor) &&
      !isIdentifier(interceptor) &&
      !isMemberExpression(interceptor)
    ) {
      throw new ASTDecoratorsError(
        'Accessor interceptor can only be function, free variable or object property',
      );
    }
  }
};

export const createStorage = (
  klass: NodePath<Class>,
  member: NodePath<ClassMemberProperty>,
  privacy: PrivacyType = 'hard',
): ClassMemberProperty =>
  createPropertyByPrivacy(
    privacy,
    String(getMemberName(member.node)),
    member.node.value,
    klass,
  );

const declarator = template(`const VAR = FUNCTION`);

export const generateInterceptor = (
  klass: NodePath<Class>,
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
  interceptor: NodePath<AccessorInterceptorNode> | undefined,
  impl: AccessorMethodCreator,
): ASTClassMemberDecorator<TransformAccessorOptions> => (
  klass: NodePath<Class>,
  member: NodePath<ClassMemberProperty>,
  {interceptorContext, privacy}: TransformAccessorOptions = {},
  {filename}: PluginPass,
): void => {
  assert(decorator, member, [interceptor]);

  const storage = createStorage(klass, member, privacy);

  const method = impl(
    klass,
    member,
    interceptor,
    storage.key as Identifier | PrivateName,
    {
      preservingDecorators: member.node.decorators,
      useContext: shouldUseContext(interceptor, interceptorContext, filename),
    },
  );

  member.replaceWithMultiple([storage, method]);
};

export const injectInterceptor = (
  klass: NodePath<Class>,
  interceptor: AccessorInterceptorNode,
  value: MemberExpression | Identifier,
  type: 'get' | 'set',
  useContext: boolean,
): CallExpression => {
  const interceptorId = generateInterceptor(klass, interceptor, type);

  return isArrowFunctionExpression(interceptor) ||
    (isIdentifier(interceptor) && !useContext)
    ? callExpression(interceptorId, [value])
    : callExpression(memberExpression(interceptorId, identifier('call')), [
        thisExpression(),
        value,
      ]);
};
