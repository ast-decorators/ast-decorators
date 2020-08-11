import {PrivacyType} from '@ast-decorators/utils/lib/common';
import {ASTSimpleDecorator} from '@ast-decorators/utils/lib/common';
import {NodePath} from '@babel/core';
import {ClassBody, privateName, StringLiteral} from '@babel/types';

export type TransformerOptions = {privacy?: PrivacyType};

export type BabelObject = {
  types: typeof import('@babel/types');
};

export default (
  {types: t}: BabelObject,
  {privacy}: TransformerOptions = {},
) => [
  [
    (
      name: NodePath<StringLiteral>,
      value: NodePath<StringLiteral>,
    ): ASTSimpleDecorator => ({klass}) => {
      const classBody = klass.get('body') as NodePath<ClassBody>;
      const id = classBody.scope.generateUidIdentifier(name.node.value);
      const node =
        privacy === 'hard'
          ? t.classPrivateProperty(privateName(id), value.node)
          : t.classProperty(id, value.node);

      classBody.unshiftContainer('body', [node]);
    },
    (name) => name === 'foo',
  ],
];
