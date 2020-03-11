import {ASTClassMemberDecorator} from '@ast-decorators/typings';
import {PrivateName} from '@ast-decorators/utils/node_modules/@babel/types';
import {NodePath} from '@babel/core';
import {Identifier} from '@babel/types';
import {createGetterMethod} from './getter';
import {createSetterMethod} from './setter';
import {
  AccessorAllowedMember,
  AccessorInterceptor,
  AccessorInterceptorNode,
  assert,
  createStorage,
} from './utils';

export type AccessorDecorator = (
  get?: AccessorInterceptor,
  set?: AccessorInterceptor,
) => PropertyDecorator;

const accessor: AccessorDecorator = ((
  get?: NodePath<AccessorInterceptorNode>,
  set?: NodePath<AccessorInterceptorNode>,
): ASTClassMemberDecorator => (
  klass,
  member: NodePath<AccessorAllowedMember>,
  options,
) => {
  assert('accessor', member, [get, set]);

  const storage = createStorage(klass, member, options);
  const getter = createGetterMethod(
    klass,
    member,
    get,
    storage.key as Identifier | PrivateName,
    // TODO: Add option to set up context
    true,
  );
  const setter = createSetterMethod(
    klass,
    member,
    set,
    storage.key as Identifier | PrivateName,
    // TODO: Add option to set up context
    true,
  );

  member.replaceWithMultiple([storage, getter, setter]);
}) as any;

export default accessor;
