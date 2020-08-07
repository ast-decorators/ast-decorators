import template from '@babel/template';
import type {NodePath} from '@babel/traverse';
import {
  Class,
  classPrivateProperty,
  ClassProperty,
  classProperty,
  privateName,
} from '@babel/types';
import type {ClassMemberProperty, PrivacyType} from './common';

const createSymbolAssignment = template.statement(`const VAR = Symbol()`);

export type PropertyOptions = Readonly<{
  static?: boolean;
  value?: ClassProperty['value'];
}>;

const createPropertyByPrivacy = (
  privacy: PrivacyType,
  name: string | number | undefined,
  klass: NodePath<Class>,
  {static: _static, value}: PropertyOptions = {},
): ClassMemberProperty => {
  const uid = name?.toString();

  switch (privacy) {
    case 'hard': {
      const classBody = klass.get('body');
      const id = classBody.scope.generateUidIdentifier(uid);
      const privateId = privateName(id);

      const prop = classPrivateProperty(privateId, value, null);

      // @ts-expect-error: "static" is not listed in d.ts
      prop.static = _static;

      return prop;
    }
    case 'soft': {
      const id = klass.parentPath.scope.generateUidIdentifier(uid);
      klass.insertBefore([createSymbolAssignment({VAR: id})]);

      return classProperty(id, value, null, null, true);
    }
    default: {
      const classBody = klass.get('body');
      const id = classBody.scope.generateUidIdentifier(uid);

      return classProperty(id, value);
    }
  }
};

export default createPropertyByPrivacy;
