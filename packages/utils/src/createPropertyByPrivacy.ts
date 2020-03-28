import {ClassMemberProperty, PrivacyType} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import template from '@babel/template';
import {
  Class,
  ClassBody,
  classPrivateProperty,
  ClassProperty,
  classProperty,
  privateName,
} from '@babel/types';

const createSymbolAssignment = template.statement(`const VAR = Symbol()`);

export type PropertyOptions = Readonly<{
  static?: boolean;
  value?: ClassProperty['value'];
}>;

const createPropertyByPrivacy = (
  privacy: PrivacyType,
  name: string | undefined,
  klass: NodePath<Class>,
  {static: _static, value}: PropertyOptions = {},
): ClassMemberProperty => {
  switch (privacy) {
    case 'hard': {
      const classBody = klass.get('body') as NodePath<ClassBody>;
      const id = classBody.scope.generateUidIdentifier(name);
      const privateId = privateName(id);

      const prop = classPrivateProperty(privateId, value, null);

      // @ts-ignore
      prop.static = _static;

      return prop;
    }
    case 'soft': {
      const id = klass.parentPath.scope.generateUidIdentifier(name);
      klass.insertBefore([createSymbolAssignment({VAR: id})]);

      return classProperty(id, value, null, null, true);
    }
    default: {
      const classBody = klass.get('body') as NodePath<ClassBody>;
      const id = classBody.scope.generateUidIdentifier(name);

      return classProperty(id, value);
    }
  }
};

export default createPropertyByPrivacy;
