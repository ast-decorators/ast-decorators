import {DecorableClass} from '@ast-decorators/typings';
import {template} from '@babel/core';
import {NodePath} from '@babel/traverse';
import {Statement} from '@babel/types';

export const foo = (...params: any[]): ClassDecorator =>
  ((klass: NodePath<DecorableClass>) => {
    const consoleTpl = template(`console.log(PARAM)`);

    for (const param of params) {
      klass.insertAfter([
        consoleTpl({
          PARAM: param.node,
        }) as Statement,
      ]);
    }
  }) as any;
