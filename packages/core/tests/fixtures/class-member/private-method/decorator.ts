import {DecorableClass} from '@ast-decorators/utils/lib/commonTypes';
import {NodePath} from '@babel/core';
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

const bind: PropertyDecorator = ((
  _: NodePath<DecorableClass>,
  property: NodePath<ClassPrivateMethod>,
) => {
  const constructor = classMethod(
    'constructor',
    identifier('constructor'),
    [],
    blockStatement([
      expressionStatement(
        assignmentExpression(
          '=',
          memberExpression(thisExpression(), property.node.key),
          callExpression(
            memberExpression(
              memberExpression(thisExpression(), property.node.key),
              identifier('bind'),
            ),
            [thisExpression()],
          ),
        ),
      ),
    ]),
  );

  property.insertBefore(constructor);
}) as any;

export default bind;
