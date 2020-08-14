import {cloneNode} from '@ast-decorators/utils/lib/babelFixes';
import checkSuitability from '@ast-decorators/utils/lib/checkSuitability';
import type {ASTCallableDecorator} from '@ast-decorators/utils/lib/common';
import {extractDecoratorMetadata} from '@ast-decorators/utils/lib/metadata';
import {
  ClassMember,
  ClassMemberProperty,
} from '@ast-decorators/utils/src/common';
import type {NodePath} from '@babel/traverse';
import {
  Class,
  Decorator,
  Identifier,
  isMethod,
  isProperty,
  PrivateName,
} from '@babel/types';
import {getter} from './getter';
import {setter} from './setter';
import {
  AccessorInterceptorNode,
  assert,
  createStorage,
  TransformAccessorOptions,
  TransformedNode,
  TRANSFORMER_NAME,
} from './utils';

export type AccessorInterceptors = Readonly<{
  get?: NodePath<AccessorInterceptorNode>;
  set?: NodePath<AccessorInterceptorNode>;
}>;

export type AccessorOptions = TransformAccessorOptions &
  Readonly<{
    accessorDecoratorName: string;
    filename: string;
  }>;

export const accessor = (
  klass: NodePath<Class>,
  member: NodePath<ClassMember>,
  {get, set}: AccessorInterceptors,
  {
    accessorDecoratorName,
    filename,
    privacy,
    singleAccessorDecorators,
    transformerPath,
    useClassNameForStatic,
  }: AccessorOptions,
): readonly [TransformedNode?, TransformedNode?, ClassMemberProperty?] => {
  const decorators = member.node.decorators
    ? (member.get('decorators') as ReadonlyArray<NodePath<Decorator>>)
    : null;

  const useClassName = 'static' in member.node && !!useClassNameForStatic;
  const isMemberProperty = isProperty(member.node);

  const storage = isMemberProperty
    ? createStorage(klass, member.node as ClassMemberProperty, privacy)
    : undefined;

  const getterResults =
    isMemberProperty || (isMethod(member.node) && member.node.kind === 'get')
      ? getter(
          klass,
          member,
          get,
          storage?.key as Identifier | PrivateName | undefined,
          {
            preservingDecorators: decorators?.map(({node}) => node) ?? null,
            useClassName,
          },
        )
      : undefined;

  const bothAccessorsDecorators = decorators
    ?.filter((decorator) => {
      const {importSource, originalImportName} = extractDecoratorMetadata(
        decorator,
      );

      return (
        (importSource?.value === transformerPath &&
          originalImportName === accessorDecoratorName) ||
        !checkSuitability(
          {
            name: originalImportName,
            source: importSource?.value,
          },
          singleAccessorDecorators,
          filename,
        )
      );
    })
    // We need to add decorator nodes to binding registry only if we create two
    // nodes (getter and setter) instead of one (property).
    .map(({node}) => (isMemberProperty ? cloneNode(node) : node));

  const setterResults =
    isMemberProperty || (isMethod(member.node) && member.node.kind === 'set')
      ? setter(
          klass,
          member,
          set,
          storage?.key as Identifier | PrivateName | undefined,
          {
            preservingDecorators: bothAccessorsDecorators ?? null,
            useClassName,
          },
        )
      : undefined;

  return [getterResults, setterResults, storage];
};

export const accessorTransformer: ASTCallableDecorator<
  [NodePath<AccessorInterceptorNode>?, NodePath<AccessorInterceptorNode>?],
  TransformAccessorOptions
> = (get, set) => (
  {klass, member},
  options: TransformAccessorOptions = {},
  {filename},
) => {
  assert('accessor', member!.node, [get?.node, set?.node]);

  const [
    [getMethod, getterDeclarations] = [],
    [setMethod, setterDeclarations] = [],
    storage,
  ] = accessor(
    klass,
    member!,
    {get, set},
    {
      ...options,
      accessorDecoratorName: 'accessor',
      filename,
      transformerPath: options.transformerPath ?? TRANSFORMER_NAME,
    },
  );

  klass.insertBefore([
    ...(getterDeclarations ?? []),
    ...(setterDeclarations ?? []),
  ]);

  if (storage) {
    member!.insertBefore(storage);
  }

  if (getMethod && setMethod) {
    member!.replaceWithMultiple([getMethod, setMethod]);
  } else if (getMethod) {
    member!.replaceWith(getMethod);
  } else if (setMethod) {
    member!.replaceWith(setMethod);
  }
};
