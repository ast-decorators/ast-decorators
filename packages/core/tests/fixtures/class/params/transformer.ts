import {NodePath, template} from '@babel/core';
import {Class, Statement} from '@babel/types';

const foo = (...params: NodePath[]) => (klass: NodePath<Class>) => {
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
