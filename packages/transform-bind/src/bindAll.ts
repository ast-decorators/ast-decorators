import {
  ASTClassMemberDecorator,
  ClassMember,
} from '@ast-decorators/utils/lib/common';
import {NodePath} from '@babel/core';
import {
  ClassBody,
  FunctionDeclaration,
  isClassMethod,
  isClassPrivateMethod,
} from '@babel/types';
import {bind} from './bind';
import {TransformBindOptions} from './utils';

export const bindAllTransformer: ASTClassMemberDecorator<TransformBindOptions> = klass => {
  const classBody = klass.get('body') as NodePath<ClassBody>;
  const members = classBody.get('body') as ReadonlyArray<NodePath<ClassMember>>;

  for (const member of members) {
    const {node} = member;

    const declarations: FunctionDeclaration[] = [];

    if (isClassMethod(node) || isClassPrivateMethod(node)) {
      const [replacement, declaration] = bind(node, klass.scope);

      if (declaration) {
        declarations.push(declaration);
      }

      if (Array.isArray(replacement)) {
        member.replaceWithMultiple(replacement);
      } else {
        member.replaceWith(replacement);
      }
    }

    klass.insertBefore(declarations);
  }
};
