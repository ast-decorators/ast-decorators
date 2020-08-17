import ASTDecoratorsError from '@ast-decorators/utils/lib/ASTDecoratorsError';
import checkSuitability, {
  SuitabilityFactors,
} from '@ast-decorators/utils/lib/checkSuitability';
import type {
  ClassMember,
  ClassMemberMethod,
  ClassMemberProperty,
  PrivacyType,
} from '@ast-decorators/utils/lib/common';
import createPropertyByPrivacy from '@ast-decorators/utils/lib/createPropertyByPrivacy';
import getMemberName from '@ast-decorators/utils/lib/getMemberName';
import {extractDecoratorMetadata} from '@ast-decorators/utils/lib/metadata';
import type {NodePath, Scope} from '@babel/traverse';
import {
  ArrayPattern,
  ArrowFunctionExpression,
  Class,
  cloneNode,
  Decorator,
  FunctionDeclaration,
  FunctionExpression,
  Identifier,
  isArrayPattern,
  isArrowFunctionExpression,
  isClassMethod,
  isClassPrivateMethod,
  isClassPrivateProperty,
  isClassProperty,
  isFunctionExpression,
  isIdentifier,
  isMemberExpression,
  isObjectPattern,
  MemberExpression,
  ObjectPattern,
  PrivateName,
  ThisExpression,
  thisExpression,
  variableDeclaration,
  VariableDeclaration,
  variableDeclarator,
} from '@babel/types';

export const TRANSFORMER_NAME = '@ast-decorators/transform-accessor';

export type TransformedNode = readonly [
  ClassMemberMethod?,
  ReadonlyArray<FunctionDeclaration | VariableDeclaration>?,
];

export type TransformAccessorOptions = Readonly<{
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

export type AccessorMethodCreatorOptions = Readonly<{
  useClassName: boolean;
  preservingDecorators: Decorator[] | null;
}>;

export type AccessorMethodCreator = (
  klass: NodePath<Class>,
  member: NodePath<ClassMember>,
  interceptor: NodePath<AccessorInterceptorNode> | undefined,
  storage: Identifier | PrivateName | undefined,
  options: AccessorMethodCreatorOptions,
) => TransformedNode;

export type TwinAccessorOptions = Omit<
  TransformAccessorOptions,
  'transformerPath'
> &
  Readonly<{
    filename: string;
  }>;

export type TwinAccessorTransformedNode = readonly [
  TransformedNode,
  TransformedNode,
  ClassMemberProperty?,
];

export const isGetter = (member: ClassMemberMethod): boolean =>
  member.kind === 'get';
export const isSetter = (member: ClassMemberMethod): boolean =>
  member.kind === 'set';

export const assert = (
  decorator: string,
  member: ClassMember,
  interceptors: ReadonlyArray<AccessorInterceptorNode | undefined>,
): void => {
  if (
    !(isClassProperty(member) || isClassPrivateProperty(member)) &&
    !(
      (isClassMethod(member) || isClassPrivateMethod(member)) &&
      (isGetter(member) || isSetter(member))
    )
  ) {
    throw new ASTDecoratorsError(
      `@${decorator}: applying to something other than property or accessor is not allowed`,
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
        `@${decorator}: interceptor can only be function, free variable or object property`,
      );
    }
  }
};

export const createStorage = (
  klass: NodePath<Class>,
  member: ClassMemberProperty,
  privacy: PrivacyType = 'hard',
): ClassMemberProperty =>
  createPropertyByPrivacy(privacy, getMemberName(member), klass, {
    // @ts-expect-error: "static" is not listed in d.ts
    static: member.static,
    value: member.value,
  });

export const ownerNode = (
  klass: Class,
  useClassName: boolean,
): Identifier | ThisExpression =>
  useClassName && klass.id ? cloneNode(klass.id) : thisExpression();

export const unifyValueParameter = (
  scope: Scope,
  rawValue: Identifier | ArrayPattern | ObjectPattern,
): [Identifier, VariableDeclaration?] => {
  if (isObjectPattern(rawValue) || isArrayPattern(rawValue)) {
    const value = scope.generateUidIdentifier('value');

    return [
      value,
      variableDeclaration('const', [variableDeclarator(rawValue, value)]),
    ];
  }

  return [rawValue];
};

export type SetterDecoratorPreparationOptions = Readonly<{
  filename: string;
  singleAccessorDecorators?: SuitabilityFactors;
}>;

export const prepareSetterDecorators = (
  decorators: ReadonlyArray<NodePath<Decorator>>,
  {filename, singleAccessorDecorators}: SetterDecoratorPreparationOptions,
): ReadonlyArray<NodePath<Decorator>> =>
  decorators.filter((decorator) => {
    const {importSource, originalImportName} = extractDecoratorMetadata(
      decorator,
    );

    return !checkSuitability(
      {
        name: originalImportName,
        source: importSource?.value,
      },
      singleAccessorDecorators,
      filename,
    );
  });

export const applyChanges = (
  klass: NodePath<Class>,
  member: NodePath<ClassMember>,
  [
    [getMethod, getterDeclarations = []],
    [setMethod, setterDeclarations = []],
    storage,
  ]: TwinAccessorTransformedNode,
): void => {
  klass.insertBefore([...getterDeclarations, ...setterDeclarations]);

  if (storage) {
    member.insertBefore(storage);
  }

  if (getMethod && setMethod) {
    member.replaceWithMultiple([getMethod, setMethod]);
  } else if (getMethod) {
    member.replaceWith(getMethod);
  } else if (setMethod) {
    member.replaceWith(setMethod);
  }
};
