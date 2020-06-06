import {ASTSimpleDecorator} from '@ast-decorators/utils/lib/common';
import {template} from '@babel/core';
import {Statement} from '@babel/types';

const bar: ASTSimpleDecorator = ({klass}) => {
  const consoleTpl = template(`console.log('bar')`);
  klass.insertAfter([consoleTpl() as Statement]);
};

export default () => [[bar, name => name === 'bar']];
