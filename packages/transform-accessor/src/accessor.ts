import {ASTClassMemberDecorator} from '@ast-decorators/typings';
import {PrivateName} from '@ast-decorators/utils/node_modules/@babel/types';
import {NodePath} from '@babel/core';
import {Identifier} from '@babel/types';
import {_getter} from './getter';
import {_setter} from './setter';
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
  const getter = _getter(
    klass,
    member,
    get,
    storage.key as Identifier | PrivateName,
  );
  const setter = _setter(
    klass,
    member,
    set,
    storage.key as Identifier | PrivateName,
  );

  member.replaceWithMultiple([storage, getter, setter]);
}) as any;

export default accessor;
