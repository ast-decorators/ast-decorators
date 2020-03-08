import {DecorableClass, DecorableClassMember} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {_getter} from './getter';
import {_setter} from './setter';
import {
  AccessorAllowedMember,
  AccessorInterceptor,
  AccessorInterseptorNode,
  assert,
  createStorage,
} from './utils';

const accessor = (
  get: AccessorInterceptor,
  set: AccessorInterceptor,
): PropertyDecorator =>
  ((
    klass: NodePath<DecorableClass>,
    member: NodePath<DecorableClassMember>,
  ) => {
    assert('accessor', member as NodePath<AccessorAllowedMember>);

    const storage = createStorage(
      klass,
      member as NodePath<AccessorAllowedMember>,
    );

    const getter = _getter(
      klass,
      member as NodePath<AccessorAllowedMember>,
      (get as unknown) as NodePath<AccessorInterseptorNode>,
      storage,
    );

    const setter = _setter(
      klass,
      member as NodePath<AccessorAllowedMember>,
      (set as unknown) as NodePath<AccessorInterseptorNode>,
      storage,
    );

    member.replaceWithMultiple([storage, getter, setter]);
  }) as any;

export default accessor;
