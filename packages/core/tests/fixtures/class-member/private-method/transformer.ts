import {ASTDecoratorNodes} from '@ast-decorators/utils/lib/common';
import {
  assignmentExpression,
  blockStatement,
  callExpression,
  classMethod,
  expressionStatement,
  identifier,
  memberExpression,
  thisExpression,
} from '@babel/types';

const bind = ({member}: Required<ASTDecoratorNodes>) => {
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
