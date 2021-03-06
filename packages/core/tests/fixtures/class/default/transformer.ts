import {ASTDecoratorTransformer} from '@ast-decorators/utils/lib/common';
import {ASTDecoratorNodes} from '@ast-decorators/utils/lib/common';
import {NodePath, template} from '@babel/core';
import {StringLiteral} from '@babel/types';
import minimatch from 'minimatch';

const tpl = template.statements('customElements.define(NAME, CLASS)');

const element = (name: NodePath<StringLiteral>) => ({
  klass,
}: ASTDecoratorNodes) => {
  const nodes = tpl({
    CLASS: klass.node.id,
    NAME: name.node,
  });

  klass.insertAfter(nodes);
};

const transformer: ASTDecoratorTransformer = () => [
  [
    element,
    (name: string, path: string) =>
      name === 'element' &&
      minimatch(path, '**/fixtures/class/default/decorators'),
  ],
];

export default transformer;
