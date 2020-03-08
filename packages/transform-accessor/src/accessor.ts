import {DecorableClass} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {_getter} from './getter';
import {_setter} from './setter';
import {
  AccessorAllowedMember,
  AccessorInterceptor,
  AccessorInterceptorNode,
  assert,
  createStorage,
} from './utils';

const accessor = (
  get?: AccessorInterceptor,
  set?: AccessorInterceptor,
): PropertyDecorator =>
  ((
    klass: NodePath<DecorableClass>,
    member: NodePath<AccessorAllowedMember>,
  ) => {
    assert('accessor', member, [
      (get as unknown) as NodePath<AccessorInterceptorNode>,
      (set as unknown) as NodePath<AccessorInterceptorNode>,
    ]);

    const storage = createStorage(klass, member);

    const getter = _getter(
      klass,
      member,
      (get as unknown) as NodePath<AccessorInterceptorNode>,
      storage,
    );

    const setter = _setter(
      klass,
      member,
      (set as unknown) as NodePath<AccessorInterceptorNode>,
      storage,
    );

    member.replaceWithMultiple([storage, getter, setter]);
  }) as any;

export default accessor;
