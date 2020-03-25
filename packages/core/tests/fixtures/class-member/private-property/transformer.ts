import {NodePath} from '@babel/core';
import {
  blockStatement,
  Class,
  classPrivateMethod,
  ClassPrivateProperty,
  returnStatement,
} from '@babel/types';

const readonly = (
  _: NodePath<Class>,
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
