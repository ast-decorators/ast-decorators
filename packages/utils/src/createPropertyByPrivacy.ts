import {DecorableClass, PrivacyType} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import template from '@babel/template';
import {
  ClassBody,
  classPrivateProperty,
  ClassPrivateProperty,
  ClassProperty,
  classProperty,
  Expression,
  privateName,
} from '@babel/types';

const createSymbolAssignment = template.statement(`const VAR = Symbol()`);

const createPropertyByPrivacy = (
  privacy: PrivacyType,
  name: string | undefined,
  value: Expression | null,
  klass: NodePath<DecorableClass>,
): ClassProperty | ClassPrivateProperty => {
  switch (privacy) {
    case 'hard': {
      const classBody = klass.get('body') as NodePath<ClassBody>;
      const id = classBody.scope.generateUidIdentifier(name);
      const privateId = privateName(id);

      return classPrivateProperty(privateId, value);
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
