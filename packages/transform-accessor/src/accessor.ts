import checkSuitability from '@ast-decorators/utils/lib/checkSuitability';
import type {ASTCallableDecorator} from '@ast-decorators/utils/lib/common';
import {extractDecoratorMetadata} from '@ast-decorators/utils/lib/metadata';
import type {NodePath} from '@babel/traverse';
import {Decorator, Identifier, isProperty, PrivateName} from '@babel/types';
import {getter} from './getter';
import {setter} from './setter';
import {
  AccessorInterceptorNode,
  assert,
  createStorage,
  TransformAccessorOptions,
} from './utils';

export const accessorTransformer: ASTCallableDecorator<
  [NodePath<AccessorInterceptorNode>?, NodePath<AccessorInterceptorNode>?],
  TransformAccessorOptions
> = (get, set) => (
  {klass, member},
  {
    privacy,
    singleAccessorDecorators,
    useClassNameForStatic,
  }: TransformAccessorOptions = {},
  {filename},
) => {
  assert('accessor', member!.node, [get?.node, set?.node]);

  const decorators = member!.node.decorators
    ? (member!.get('decorators') as ReadonlyArray<NodePath<Decorator>>)
    : null;

  const useClassName = 'static' in member!.node && !!useClassNameForStatic;

  const storage = isProperty(member!.node)
    ? createStorage(klass, member!.node, privacy)
    : undefined;

  const [getMethod, getterDeclarations] =
    getter(
      klass,
      member!,
      get,
      storage?.key as Identifier | PrivateName | undefined,
      {
        preservingDecorators: decorators?.map(({node}) => node) ?? null,
        useClassName,
      },
    ) ?? [];

  const bothAccessorsDecorators = decorators?.filter(decorator => {
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

  const [setMethod, setterDeclarations] =
    setter(
      klass,
      member!,
      set,
      storage?.key as Identifier | PrivateName | undefined,
      {
        preservingDecorators:
          bothAccessorsDecorators?.map(({node}) => node) ?? null,
        useClassName,
      },
    ) ?? [];

  klass.insertBefore([
    ...(getterDeclarations ?? []),
    ...(setterDeclarations ?? []),
  ]);

  if (storage) {
    member!.insertBefore(storage);
  }

  if (getMethod && setMethod) {
    member!.replaceWithMultiple([getMethod, setMethod]);
  }
};
