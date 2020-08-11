import {PrivacyType} from '@ast-decorators/utils/lib/common';
import {ASTCallableDecorator} from '@ast-decorators/utils/lib/common';
import {NodePath} from '@babel/core';
import {
  ClassBody,
  classPrivateProperty,
  classProperty,
  privateName,
  StringLiteral,
} from '@babel/types';

type TransformerOptions = {privacy?: PrivacyType};

const foo: ASTCallableDecorator<
  [NodePath<StringLiteral>, NodePath<StringLiteral>],
  TransformerOptions
> = (name, value) => ({klass}, {privacy}: TransformerOptions = {}) => {
  const classBody = klass.get('body') as NodePath<ClassBody>;
  const id = classBody.scope.generateUidIdentifier(name.node.value);
  const node =
    privacy === 'hard'
      ? classPrivateProperty(privateName(id), value.node)
      : classProperty(id, value.node);

  classBody.unshiftContainer('body', [node]);
};

export default () => [[foo, (name) => name === 'foo']];
