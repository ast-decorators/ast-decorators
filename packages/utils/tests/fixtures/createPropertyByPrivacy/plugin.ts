import {PluginPass, PrivacyType} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {
  ClassBody,
  ClassDeclaration,
  ClassProperty,
  Identifier,
  stringLiteral,
} from '@babel/types';
import createPropertyByPrivacy from '../../../src/createPropertyByPrivacy';

export type BabelPluginTestOptions = {
  privacy: PrivacyType;
};

const babelPluginTest = (): object => ({
  visitor: {
    ClassDeclaration(
      klass: NodePath<ClassDeclaration>,
      {opts}: PluginPass<BabelPluginTestOptions>,
    ) {
      const privacy = opts?.privacy ?? 'hard';
      const klassBody = klass.get('body') as NodePath<ClassBody>;
      const [member] = klassBody.get('body') as readonly NodePath<
        ClassProperty
      >[];

      const storage = createPropertyByPrivacy(
        privacy,
        (member.node.key as Identifier).name,
        stringLiteral('baz'),
        klass,
      );

      klassBody.unshiftContainer('body', [storage]);
    },
  },
});

export default babelPluginTest;
