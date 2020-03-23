import {DecorableClass} from '@ast-decorators/typings';
import {NodePath, template} from '@babel/core';
import {
  ClassMethod,
  ClassProperty,
  isClassMethod,
  isClassProperty,
  Statement,
} from '@babel/types';
import {appendConsoleLog, createGetter} from '../utils';

let count = 0;

const foo = (
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
};

const bar = (
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
};

export default () => [
  [foo, name => name === 'foo'],
  [bar, name => name === 'bar'],
];
