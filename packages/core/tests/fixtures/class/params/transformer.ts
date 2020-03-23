import {DecorableClass} from '@ast-decorators/typings';
import {template} from '@babel/core';
import {NodePath} from '@babel/traverse';
import {Statement} from '@babel/types';

const foo = (...params: NodePath[]) => (klass: NodePath<DecorableClass>) => {
  const consoleTpl = template(`console.log(PARAM)`);

  for (const param of params) {
    klass.insertAfter([
      consoleTpl({
        PARAM: param.node,
      }) as Statement,
    ]);
  }
};

export default () => [[foo, name => name === 'foo']];