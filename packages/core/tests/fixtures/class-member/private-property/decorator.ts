import {NodePath} from '@babel/core';
import {
  blockStatement,
  classPrivateMethod,
  ClassPrivateProperty,
  returnStatement,
} from '@babel/types';
import {DecorableClass} from '../../../../src/utils';

const readonly: PropertyDecorator = ((
  _: NodePath<DecorableClass>,
  property: NodePath<ClassPrivateProperty>,
) => {
  const getter = classPrivateMethod(
    'get',
    property.node.key,
    [],
    blockStatement([returnStatement(property.node.value)]),
  );

  property.replaceWith(getter);
}) as any;

export default readonly;
