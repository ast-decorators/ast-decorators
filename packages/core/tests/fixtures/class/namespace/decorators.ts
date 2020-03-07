import {template} from '@babel/core';
import {NodePath} from '@babel/traverse';
import {Statement} from '@babel/types';
import {DecorableClass} from '../../../../src/utils';

let count = 0;

export const foo = (): ClassDecorator =>
  ((klass: NodePath<DecorableClass>) => {
    const consoleTpl = template(`console.log('foo is ${count++}')`);

    klass.insertAfter([consoleTpl() as Statement]);
  }) as any;

export const bar: ClassDecorator = ((klass: NodePath<DecorableClass>) => {
  const consoleTpl = template(`console.log('bar is ${count++}')`);

  klass.insertAfter([consoleTpl() as Statement]);
}) as any;
