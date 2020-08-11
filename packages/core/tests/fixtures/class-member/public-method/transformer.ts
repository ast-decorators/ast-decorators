import {ASTDecoratorNodes} from '@ast-decorators/utils/lib/common';
import {
  assignmentExpression,
  blockStatement,
  callExpression,
  classMethod,
  ClassPrivateMethod,
  expressionStatement,
  identifier,
  memberExpression,
  thisExpression,
} from '@babel/types';

const bind = ({member}: Required<ASTDecoratorNodes<ClassPrivateMethod>>) => {
  const constructor = classMethod(
    'constructor',
    identifier('constructor'),
    [],
    blockStatement([
      expressionStatement(
        assignmentExpression(
          '=',
          memberExpression(thisExpression(), member.node.key),
          callExpression(
            memberExpression(
              memberExpression(thisExpression(), member.node.key),
              identifier('bind'),
            ),
            [thisExpression()],
          ),
        ),
      ),
    ]),
  );

  member.insertBefore(constructor);
};

export default () => [[bind, (name) => name === 'bind']];
