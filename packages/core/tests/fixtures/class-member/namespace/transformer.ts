import {ASTDecoratorNodes} from '@ast-decorators/utils/lib/common';
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

const foo = ({klass, member}: ASTDecoratorNodes) => {
  if (isClassMethod(member) && (member.node as ClassMethod).kind === 'get') {
    appendConsoleLog(member as NodePath<ClassMethod>, 'foo');
  } else if (isClassProperty(member)) {
    createGetter(member as NodePath<ClassProperty>);
  }

  klass.insertAfter([
    template(`console.log('foo is ${count++}')`)() as Statement,
  ]);
};

const bar = ({klass, member}: ASTDecoratorNodes) => {
  if (isClassMethod(member) && (member.node as ClassMethod).kind === 'get') {
    appendConsoleLog(member as NodePath<ClassMethod>, 'bar');
  } else if (isClassProperty(member)) {
    createGetter(member as NodePath<ClassProperty>);
  }

  klass.insertAfter([
    template(`console.log('bar is ${count++}')`)() as Statement,
  ]);
};

export default () => [
  [foo, (name) => name === 'foo'],
  [bar, (name) => name === 'bar'],
];
