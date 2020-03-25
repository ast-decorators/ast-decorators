import {
  ASTClassMemberDecorator,
  ClassMemberProperty,
} from '@ast-decorators/typings';
import checkDecoratorSuitability from '@ast-decorators/utils/lib/checkDecoratorSuitability';
import DecoratorMetadata from '@ast-decorators/utils/lib/DecoratorMetadata';
import {PrivateName} from '@ast-decorators/utils/node_modules/@babel/types';
import {NodePath} from '@babel/core';
import {Decorator, Identifier} from '@babel/types';
import {createGetterMethod} from './getter';
import {createSetterMethod} from './setter';
import {
  AccessorInterceptorNode,
  assert,
  createStorage,
  TransformAccessorOptions,
} from './utils';

const accessor = (
  get?: NodePath<AccessorInterceptorNode>,
  set?: NodePath<AccessorInterceptorNode>,
): ASTClassMemberDecorator<TransformAccessorOptions> => (
  klass,
  member: NodePath<ClassMemberProperty>,
  {privacy, singleAccessorDecorators}: TransformAccessorOptions = {},
  {filename},
) => {
  assert('accessor', member, [get, set]);

  const decorators = member.node.decorators
    ? (member.get('decorators') as ReadonlyArray<NodePath<Decorator>>)
    : null;

  const storage = createStorage(klass, member, privacy);
  const getter = createGetterMethod(
    klass,
    member,
    get,
    storage.key as Identifier | PrivateName,
    {
      // TODO: Add option to set up context
      allowThisContext: true,
      preservingDecorators: decorators?.map(({node}) => node) ?? null,
    },
  );

  const bothAccessorsDecorators = decorators?.filter(decorator => {
    const {identifier, importSource} = new DecoratorMetadata(decorator);

    return !checkDecoratorSuitability(
      {
        name: identifier.node.name,
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
      // TODO: Add option to set up context
      allowThisContext: true,
      preservingDecorators:
        bothAccessorsDecorators?.map(({node}) => node) ?? null,
    },
  );

  member.replaceWithMultiple([storage, getter, setter]);
};

export default accessor;
