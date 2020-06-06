import {ASTDecoratorNodes} from '@ast-decorators/utils/lib/common';
import {
  blockStatement,
  classPrivateMethod,
  ClassPrivateProperty,
  returnStatement,
} from '@babel/types';

const readonly = ({
  member,
}: Required<ASTDecoratorNodes<ClassPrivateProperty>>) => {
  const getter = classPrivateMethod(
    'get',
    member.node.key,
    [],
    blockStatement([returnStatement(member.node.value)]),
  );

  member.replaceWith(getter);
};

export default () => [[readonly, name => name === 'readonly']];
