import {
  ASTDecoratorPluginOptions,
  DecorableClass,
} from '@ast-decorators/typings';
import {NodePath} from '@babel/traverse';
import {
  ClassBody,
  classPrivateProperty,
  classProperty,
  privateName,
  StringLiteral,
} from '@babel/types';

export type PrivacyPluginOptions = {
  privacy: 'hard' | 'none';
};

const PLUGIN_NAME = 'privacy-plugin';

export type FooDecorator = (name: string, value: string) => ClassDecorator;

export const foo: FooDecorator = ((
  name: NodePath<StringLiteral>,
  value: NodePath<StringLiteral>,
) => (
  klass: NodePath<DecorableClass>,
  options?: ASTDecoratorPluginOptions<typeof PLUGIN_NAME, PrivacyPluginOptions>,
) => {
  const privacy = options?.[PLUGIN_NAME]?.privacy ?? 'hard';

  const classBody = klass.get('body') as NodePath<ClassBody>;
  const id = classBody.scope.generateUidIdentifier(name.node.value);
  const node =
    privacy === 'hard'
      ? classPrivateProperty(privateName(id), value.node)
      : classProperty(id, value.node);

  classBody.unshiftContainer('body', [node]);
}) as any;
