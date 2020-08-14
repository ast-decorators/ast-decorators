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

const createPropertyByPrivacy = (
  privacy: PrivacyType,
  name: string | number | undefined,
  klass: NodePath<Class>,
  options?: Partial<Pick<ClassProperty, 'decorators' | 'static' | 'value'>>,
): ClassMemberProperty => {
  const uid = name?.toString();

  switch (privacy) {
    case 'hard': {
      const classBody = klass.get('body');
      const id = classBody.scope.generateUidIdentifier(uid);
      const privateId = privateName(id);

      const prop = classPrivateProperty(
        privateId,
        options?.value,
        options?.decorators,
      );

      // @ts-expect-error: "static" is not listed in d.ts
      prop.static = options?.static;

      return prop;
    }
    case 'soft': {
      const id = klass.parentPath.scope.generateUidIdentifier(uid);
      klass.insertBefore([createSymbolAssignment({VAR: id})]);

      return classProperty(
        id,
        options?.value,
        null,
        options?.decorators,
        true,
        options?.static,
      );
    }
    default: {
      const classBody = klass.get('body');
      const id = classBody.scope.generateUidIdentifier(uid);

      return classProperty(
        id,
        options?.value,
        null,
        options?.decorators,
        false,
        options?.static,
      );
    }
  }
};

export default createPropertyByPrivacy;
