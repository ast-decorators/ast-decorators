import checkSuitability from '@ast-decorators/utils/lib/checkSuitability';
import {
  ASTClassMemberDecorator,
  ClassMemberProperty,
} from '@ast-decorators/utils/lib/common';
import {DecoratorMetadata} from '@ast-decorators/utils/lib/metadata';
import {NodePath} from '@babel/core';
import {Decorator, Identifier, PrivateName} from '@babel/types';
import {getter} from './getter';
import {setter} from './setter';
import shouldInterceptorUseContext from '@ast-decorators/utils/lib/shouldInterceptorUseContext';
import {
  AccessorInterceptorNode,
  assert,
  createStorage,
  TransformAccessorOptions,
} from './utils';

export const accessorTransformer = (
  get?: NodePath<AccessorInterceptorNode>,
  set?: NodePath<AccessorInterceptorNode>,
): ASTClassMemberDecorator<TransformAccessorOptions> => (
  klass,
  member: NodePath<ClassMemberProperty>,
  {
    interceptorContext,
    privacy,
    singleAccessorDecorators,
    useClassNameForStatic,
  }: TransformAccessorOptions = {},
  {filename},
) => {
  assert('accessor', member, [get, set]);

  const decorators = member.node.decorators
    ? (member.get('decorators') as ReadonlyArray<NodePath<Decorator>>)
    : null;

  // @ts-ignore
  const useClassName = !!member.node.static && !!useClassNameForStatic;

  const storage = createStorage(klass, member, privacy);
  const [getMethod, getterDeclarations] = getter(
    klass,
    member,
    get,
    storage.key as Identifier | PrivateName,
    {
      preservingDecorators: decorators?.map(({node}) => node) ?? null,
      useClassName,
      useContext: shouldInterceptorUseContext(
        get,
        interceptorContext,
        filename,
      ),
    },
  );

  const bothAccessorsDecorators = decorators?.filter(decorator => {
    const {importSource, originalImportName} = new DecoratorMetadata(decorator);

    return !checkSuitability(
      {
        name: originalImportName,
        source: importSource?.node.value,
      },
      singleAccessorDecorators,
      filename,
    );
  });

  const [setMethod, setterDeclarations] = setter(
    klass,
    member,
    set,
    storage.key as Identifier | PrivateName,
    {
      preservingDecorators:
        bothAccessorsDecorators?.map(({node}) => node) ?? null,
      useClassName,
      useContext: shouldInterceptorUseContext(
        set,
        interceptorContext,
        filename,
      ),
    },
  );

  klass.insertBefore([...getterDeclarations, ...setterDeclarations]);
  member.replaceWithMultiple([storage, getMethod, setMethod]);
};
