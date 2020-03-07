import {NodePath, template} from '@babel/core';
import {
  BlockStatement,
  blockStatement,
  ClassMethod,
  classMethod,
  ClassProperty,
  isClassMethod,
  isClassProperty,
  returnStatement,
  Statement,
} from '@babel/types';
import {DecorableClass} from '../../../../src/utils';

let count = 0;

const appendConsoleLog = (property: NodePath<ClassMethod>, id: string) => {
  (property.get('body') as NodePath<BlockStatement>).unshiftContainer('body', [
    template(`console.log('The last is ${id}')`)() as Statement,
  ]);
};

const createGetter = (property: NodePath<ClassProperty>) => {
  const method = classMethod(
    'get',
    property.node.key,
    [],
    blockStatement([returnStatement(property.node.value)]),
  );

  method.decorators = property.node.decorators;

  property.replaceWith(method);
};

export const foo: PropertyDecorator = ((
  klass: NodePath<DecorableClass>,
  property: NodePath<ClassProperty | ClassMethod>,
) => {
  if (
    isClassMethod(property) &&
    (property.node as ClassMethod).kind === 'get'
  ) {
    appendConsoleLog(property as NodePath<ClassMethod>, 'foo');
  } else if (isClassProperty(property)) {
    createGetter(property as NodePath<ClassProperty>);
  }

  klass.insertAfter([
    template(`console.log('foo is ${count++}')`)() as Statement,
  ]);
}) as any;

export const bar: PropertyDecorator = ((
  klass: NodePath<DecorableClass>,
  property: NodePath<ClassProperty | ClassMethod>,
) => {
  if (
    isClassMethod(property) &&
    (property.node as ClassMethod).kind === 'get'
  ) {
    appendConsoleLog(property as NodePath<ClassMethod>, 'bar');
  } else if (isClassProperty(property)) {
    createGetter(property as NodePath<ClassProperty>);
  }

  klass.insertAfter([
    template(`console.log('bar is ${count++}')`)() as Statement,
  ]);
}) as any;
