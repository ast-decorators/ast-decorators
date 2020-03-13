import {
  ASTDecoratorTransformerOptions,
  DecorableClass,
  PrivacyType,
} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {
  ClassBody,
  ClassProperty,
  Identifier,
  stringLiteral,
} from '@babel/types';
import createPropertyByPrivacy from '../../../src/createPropertyByPrivacy';

const TRANSFORMER_NAME = 'privacy-test';

type PrivacyTestOptions = {
  privacy: PrivacyType;
};

const foo: PropertyDecorator = ((
  klass: NodePath<DecorableClass>,
  member: NodePath<ClassProperty>,
  options?: ASTDecoratorTransformerOptions<
    typeof TRANSFORMER_NAME,
    PrivacyTestOptions
  >,
) => {
  const privacy = options?.[TRANSFORMER_NAME]?.privacy ?? 'hard';

  const storage = createPropertyByPrivacy(
    privacy,
    (member.node.key as Identifier).name,
    stringLiteral('baz'),
    klass,
  );

  const klassBody = klass.get('body') as NodePath<ClassBody>;
  klassBody.unshiftContainer('body', [storage]);
}) as any;

export default foo;
