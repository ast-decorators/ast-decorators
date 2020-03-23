import {DecorableClass} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {
  blockStatement,
  classPrivateMethod,
  ClassPrivateProperty,
  returnStatement,
} from '@babel/types';

const readonly = (
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
};

export default () => [[readonly, name => name === 'readonly']];
