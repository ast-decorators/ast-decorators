import {DecorableClass} from '@ast-decorators/utils/lib/commonTypes';
import {template} from '@babel/core';
import {NodePath} from '@babel/traverse';
import {Statement} from '@babel/types';

export type FooDecorator = (...params: any[]) => ClassDecorator;

export const foo: FooDecorator = ((...params: NodePath[]) => (
  klass: NodePath<DecorableClass>,
) => {
  const consoleTpl = template(`console.log(PARAM)`);

  for (const param of params) {
    klass.insertAfter([
      consoleTpl({
        PARAM: param.node,
      }) as Statement,
    ]);
  }
}) as any;
