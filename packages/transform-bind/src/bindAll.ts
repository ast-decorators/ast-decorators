import ASTDecoratorsError from '@ast-decorators/utils/lib/ASTDecoratorsError';
import type {
  ASTSimpleDecorator,
  ClassMember,
  ClassMemberMethod,
} from '@ast-decorators/utils/lib/common';
import type {NodePath} from '@babel/core';
import {
  FunctionDeclaration,
  isClassMethod,
  isClassPrivateMethod,
} from '@babel/types';
import {bind} from './bind';
import {TransformBindOptions} from './utils';

export const bindAllTransformer: ASTSimpleDecorator<
  TransformBindOptions,
  ClassMemberMethod
> = ({klass, member: forbiddenMember}) => {
  if (forbiddenMember) {
    throw new ASTDecoratorsError(
      'Applying @bindAll decorator to something other than class is not allowed',
    );
  }

  const classBody = klass.get('body');
  const members = classBody.get('body') as ReadonlyArray<NodePath<ClassMember>>;

  for (const member of members) {
    const {node} = member;

    const declarations: FunctionDeclaration[] = [];

    if (isClassMethod(node) || isClassPrivateMethod(node)) {
      member.replaceWithMultiple(bind(node, klass.scope));
    }

    klass.insertBefore(declarations);
  }
};
