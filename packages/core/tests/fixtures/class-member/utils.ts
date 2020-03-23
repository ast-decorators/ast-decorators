import {NodePath, template} from '@babel/core';
import {
  blockStatement,
  BlockStatement,
  classMethod,
  ClassMethod,
  ClassProperty,
  returnStatement,
  Statement,
} from '@babel/types';

export const appendConsoleLog = (
  property: NodePath<ClassMethod>,
  id: string,
) => {
  (property.get('body') as NodePath<BlockStatement>).unshiftContainer('body', [
    template(`console.log('The last is ${id}')`)() as Statement,
  ]);
};

export const createGetter = (property: NodePath<ClassProperty>) => {
  const method = classMethod(
    'get',
    property.node.key,
    [],
    blockStatement([returnStatement(property.node.value)]),
  );

  method.decorators = property.node.decorators;

  property.replaceWith(method);
};
