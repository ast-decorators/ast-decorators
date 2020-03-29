import {
  ASTClassMemberDecorator,
  ClassMember,
  ClassMemberMethod,
} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {ClassBody, isClassMethod, isClassPrivateMethod} from '@babel/types';
import {applyBinding, TransformBindOptions} from './utils';

const bindAll: ASTClassMemberDecorator<TransformBindOptions> = klass => {
  const classBody = klass.get('body') as NodePath<ClassBody>;
  const members = classBody.get('body') as ReadonlyArray<NodePath<ClassMember>>;

  applyBinding(
    klass,
    members.filter(
      member => isClassMethod(member) || isClassPrivateMethod(member),
    ) as ReadonlyArray<NodePath<ClassMemberMethod>>,
  );
};

export default bindAll;
