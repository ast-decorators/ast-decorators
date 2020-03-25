import {ASTClassDecorator} from '@ast-decorators/typings';
import {template} from '@babel/core';
import {Statement} from '@babel/types';

const bar: ASTClassDecorator = klass => {
  const consoleTpl = template(`console.log('bar')`);
  klass.insertAfter([consoleTpl() as Statement]);
};

export default () => [[bar, name => name === 'bar']];
