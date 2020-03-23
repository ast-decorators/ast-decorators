import {DecorableClass} from '@ast-decorators/typings';
import {template} from '@babel/core';
import {NodePath} from '@babel/traverse';
import {Statement} from '@babel/types';

let count = 0;

const foo = () => (klass: NodePath<DecorableClass>) => {
  const consoleTpl = template(`console.log('foo is ${count++}')`);

  klass.insertAfter([consoleTpl() as Statement]);
};

const bar = (klass: NodePath<DecorableClass>) => {
  const consoleTpl = template(`console.log('bar is ${count++}')`);

  klass.insertAfter([consoleTpl() as Statement]);
};

export default () => [
  [foo, name => name === 'foo'],
  [bar, name => name === 'bar'],
];
