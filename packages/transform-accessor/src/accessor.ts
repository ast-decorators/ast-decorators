import {ASTClassMemberDecorator} from '@ast-decorators/typings';
import checkDecoratorSuitability, {
  NotFileEnvironmentError,
} from '@ast-decorators/utils/lib/checkDecoratorSuitability';
import DecoratorMetadata from '@ast-decorators/utils/lib/DecoratorMetadata';
import {PrivateName} from '@ast-decorators/utils/node_modules/@babel/types';
import {NodePath} from '@babel/core';
import {Decorator, Identifier} from '@babel/types';
import {createGetterMethod} from './getter';
import {createSetterMethod} from './setter';
import {
  AccessorAllowedMember,
  AccessorInterceptor,
  AccessorInterceptorNode,
  assert,
  createStorage,
  extractOptions,
  TransformAccessorOptions,
  TRANSFORMER_NAME,
} from './utils';

export type AccessorDecorator = (
  get?: AccessorInterceptor,
  set?: AccessorInterceptor,
) => PropertyDecorator;

const accessor: AccessorDecorator = ((
  get?: NodePath<AccessorInterceptorNode>,
  set?: NodePath<AccessorInterceptorNode>,
): ASTClassMemberDecorator<
  typeof TRANSFORMER_NAME,
  TransformAccessorOptions
> => (klass, member: NodePath<AccessorAllowedMember>, {filename, opts}) => {
  assert('accessor', member, [get, set]);

  const transformerOptions = extractOptions(opts);

  const singleAccessorDecorators =
    transformerOptions.singleAccessorDecorators ?? {};

  const decorators = member.node.decorators
    ? (member.get('decorators') as ReadonlyArray<NodePath<Decorator>>)
    : null;

  const storage = createStorage(klass, member, transformerOptions);
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

  try {
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
  } catch (e) {
    if (e instanceof NotFileEnvironmentError) {
      throw new Error(
        'Using "singleAccessorDecorators" with "paths" option in a non-file ' +
          'environment is not allowed',
      );
    }

    throw e;
  }
}) as any;

export default accessor;
