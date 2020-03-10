import {DecorableClass} from '@ast-decorators/typings';
import {template} from '@babel/core';
import {NodePath} from '@babel/traverse';
import {StringLiteral} from '@babel/types';

const tpl = template.statements('customElements.define(NAME, CLASS)');

export type ElementDecorator = (name: string) => ClassDecorator;

export const element: ElementDecorator = ((name: NodePath<StringLiteral>) => (
  klass: NodePath<DecorableClass>,
) => {
  const nodes = tpl({
    CLASS: klass.node.id,
    NAME: name.node,
  });

  klass.insertAfter(nodes);
}) as any;
