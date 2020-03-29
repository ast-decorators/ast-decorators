import {
  ASTClassMemberDecorator,
  ClassMemberProperty,
} from '@ast-decorators/typings';
import checkSuitability from '@ast-decorators/utils/lib/checkSuitability';
import {DecoratorMetadata} from '@ast-decorators/utils/lib/metadata';
import {NodePath} from '@babel/core';
import {Decorator, Identifier, PrivateName} from '@babel/types';
import {createGetterMethod} from './getter';
import {createSetterMethod} from './setter';
import shouldUseContext from './utils/context';
import {
  AccessorInterceptorNode,
  assert,
  createStorage,
  TransformAccessorOptions,
} from './utils/misc';

const accessor = (
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
  const getter = createGetterMethod(
    klass,
    member,
    get,
    storage.key as Identifier | PrivateName,
    {
      preservingDecorators: decorators?.map(({node}) => node) ?? null,
      useClassName,
      useContext: shouldUseContext(get, interceptorContext, filename),
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

  const setter = createSetterMethod(
    klass,
    member,
    set,
    storage.key as Identifier | PrivateName,
    {
      preservingDecorators:
        bothAccessorsDecorators?.map(({node}) => node) ?? null,
      useClassName,
      useContext: shouldUseContext(set, interceptorContext, filename),
    },
  );

  member.replaceWithMultiple([storage, getter, setter]);
};

export default accessor;
