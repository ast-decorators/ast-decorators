import ASTDecoratorsError from '@ast-decorators/utils/lib/ASTDecoratorsError';
import type {SuitabilityFactors} from '@ast-decorators/utils/lib/checkSuitability';
import type {
  ASTClassMemberDecorator,
  ClassMemberMethod,
  ClassMemberProperty,
  PluginPass,
  PrivacyType,
} from '@ast-decorators/utils/lib/common';
import createPropertyByPrivacy from '@ast-decorators/utils/lib/createPropertyByPrivacy';
import getMemberName from '@ast-decorators/utils/lib/getMemberName';
import shouldInterceptorUseContext from '@ast-decorators/utils/lib/shouldInterceptorUseContext';
import template from '@babel/template';
import type {NodePath} from '@babel/traverse';
import {
  ArrowFunctionExpression,
  callExpression,
  CallExpression,
  Class,
  cloneNode,
  Decorator,
  FunctionDeclaration,
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
  ThisExpression,
  thisExpression,
  VariableDeclaration,
} from '@babel/types';

export type TransformedNode = readonly [
  ClassMemberMethod,
  Array<FunctionDeclaration | VariableDeclaration>,
];

export type TransformAccessorOptions = Readonly<{
  interceptorContext?: InterceptorContext;
  privacy?: PrivacyType;
  singleAccessorDecorators?: SuitabilityFactors;
  transformerPath?: string;
  useClassNameForStatic?: boolean;
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
  useClassName: boolean;
  useContext: boolean;
  preservingDecorators: Decorator[] | null;
}>;

export type AccessorMethodCreator = (
  klass: NodePath<Class>,
  member: NodePath<ClassMemberProperty>,
  accessor: NodePath<AccessorInterceptorNode> | undefined,
  storage: Identifier | PrivateName,
  options: AccessorMethodCreatorOptions,
) => TransformedNode;

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
  createPropertyByPrivacy(privacy, getMemberName(member.node), klass, {
    // @ts-ignore
    static: member.node.static,
    value: member.node.value,
  });

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
): ASTClassMemberDecorator<TransformAccessorOptions, ClassMemberProperty> => (
  klass: NodePath<Class>,
  member,
  {
    interceptorContext,
    privacy,
    useClassNameForStatic,
  }: TransformAccessorOptions = {},
  {filename}: PluginPass,
): void => {
  assert(decorator, member, [interceptor]);

  const storage = createStorage(klass, member, privacy);

  const [method, declarations] = impl(
    klass,
    member,
    interceptor,
    storage.key as Identifier | PrivateName,
    {
      preservingDecorators: member.node.decorators,
      // @ts-ignore
      useClassName: !!member.node.static && !!useClassNameForStatic,
      useContext: shouldInterceptorUseContext(
        interceptor,
        interceptorContext,
        filename,
      ),
    },
  );

  klass.insertBefore(declarations);
  member.replaceWithMultiple([storage, method]);
};

export const ownerNode = (
  klass: NodePath<Class>,
  useClassName: boolean,
): Identifier | ThisExpression =>
  useClassName && klass.node.id ? cloneNode(klass.node.id) : thisExpression();

export const prepareInterceptor = (
  klass: NodePath<Class>,
  interceptor: AccessorInterceptorNode,
  value: MemberExpression | Identifier,
  type: 'get' | 'set',
  useContext: boolean,
  useClassName: boolean,
): readonly [
  CallExpression,
  Array<FunctionDeclaration | VariableDeclaration>,
] => {
  const isArrow = isArrowFunctionExpression(interceptor);
  const isRegular = isFunctionExpression(interceptor);

  const interceptorId =
    isArrow || isRegular
      ? klass.parentPath.scope.generateUidIdentifier(`${type}Interceptor`)
      : (interceptor as Identifier);

  const declarations: Array<FunctionDeclaration | VariableDeclaration> = [];

  if (isArrow) {
    declarations.push(
      declarator({
        FUNCTION: interceptor,
        VAR: interceptorId,
      }) as VariableDeclaration,
    );
  } else if (isRegular) {
    declarations.push(
      functionDeclaration(
        interceptorId,
        (interceptor as FunctionExpression).params,
        (interceptor as FunctionExpression).body,
      ),
    );
  }

  return [
    isArrowFunctionExpression(interceptor) ||
    (isIdentifier(interceptor) && !useContext)
      ? callExpression(interceptorId, [value])
      : callExpression(memberExpression(interceptorId, identifier('call')), [
          ownerNode(klass, useClassName),
          value,
        ]),
    declarations,
  ];
};
