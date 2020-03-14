import {
  ASTDecoratorTransformerOptions,
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

export type PrivacyTransformerOptions = {
  privacy: 'hard' | 'none';
};

const TRANSFORMER_NAME = 'privacy-transformer';

export type FooDecorator = (name: string, value: string) => ClassDecorator;

export const foo: FooDecorator = ((
  name: NodePath<StringLiteral>,
  value: NodePath<StringLiteral>,
) => (
  klass: NodePath<DecorableClass>,
  options?: ASTDecoratorTransformerOptions<
    typeof TRANSFORMER_NAME,
    PrivacyTransformerOptions
  >,
) => {
  const privacy = options?.[TRANSFORMER_NAME]?.privacy ?? 'hard';

  const classBody = klass.get('body') as NodePath<ClassBody>;
  const id = classBody.scope.generateUidIdentifier(name.node.value);
  const node =
    privacy === 'hard'
      ? classPrivateProperty(privateName(id), value.node)
      : classProperty(id, value.node);

  classBody.unshiftContainer('body', [node]);
}) as any;
