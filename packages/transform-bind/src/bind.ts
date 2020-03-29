import {
  ASTClassMemberDecorator,
  ClassMemberMethod,
} from '@ast-decorators/utils/lib/common';
import {applyBinding, TransformBindOptions, assert} from './utils';
import {NodePath} from '@babel/core';

const bind: ASTClassMemberDecorator<TransformBindOptions> = (
  klass,
  member: NodePath<ClassMemberMethod>,
) => {
  assert('bind', member.node);
  applyBinding(klass, [member]);
};

export default bind;
