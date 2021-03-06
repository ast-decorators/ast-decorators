import type {ASTDecoratorNodes} from '@ast-decorators/utils/lib/common';
import {template} from '@babel/core';
import type {Statement} from '@babel/types';

class Counter {
  #count = 0;

  get count(): number {
    const result = this.#count;

    this.#count += 1;

    if (this.#count > 1) {
      this.#count = 0;
    }

    return result;
  }
}

const counter = new Counter();

const foo = () => ({klass}: ASTDecoratorNodes) => {
  const consoleTpl = template(`console.log('foo is ${counter.count}')`);

  klass.insertAfter([consoleTpl() as Statement]);
};

const bar = ({klass}: ASTDecoratorNodes) => {
  const consoleTpl = template(`console.log('bar is ${counter.count}')`);

  klass.insertAfter([consoleTpl() as Statement]);
};

export default () => [
  [foo, (name) => name === 'foo'],
  [bar, (name) => name === 'bar'],
];
