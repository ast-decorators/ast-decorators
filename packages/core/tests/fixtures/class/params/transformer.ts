import {ASTDecoratorNodes} from '@ast-decorators/utils/lib/common';
import {NodePath, template} from '@babel/core';
import {Statement} from '@babel/types';

const foo = (...params: NodePath[]) => ({klass}: ASTDecoratorNodes) => {
  const consoleTpl = template(`console.log(PARAM)`);

  for (const param of params) {
    klass.insertAfter([
      consoleTpl({
        PARAM: param.node,
      }) as Statement,
    ]);
  }
};

export default () => [[foo, (name) => name === 'foo']];
