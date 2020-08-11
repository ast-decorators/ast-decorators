import {PluginPass, PrivacyType} from '@ast-decorators/utils/lib/common';
import {ASTCallableDecorator} from '@ast-decorators/utils/lib/common';
import {NodePath} from '@babel/core';
import {
  ClassBody,
  classPrivateProperty,
  classProperty,
  privateName,
  stringLiteral,
  StringLiteral,
} from '@babel/types';
import {relative, sep} from 'path';

type TransformerOptions = {privacy?: PrivacyType};

const cwd = process.cwd();

const foo: ASTCallableDecorator<
  [NodePath<StringLiteral>, NodePath<StringLiteral>],
  TransformerOptions
> = (name) => (
  {klass},
  {privacy}: TransformerOptions = {},
  {filename}: PluginPass,
) => {
  const classBody = klass.get('body') as NodePath<ClassBody>;
  const id = classBody.scope.generateUidIdentifier(name.node.value);
  const value = stringLiteral(relative(cwd, filename).split(sep).join('/'));
  const node =
    privacy === 'hard'
      ? classPrivateProperty(privateName(id), value)
      : classProperty(id, value);

  classBody.unshiftContainer('body', [node]);
};

export default () => [[foo, (name) => name === 'foo']];
