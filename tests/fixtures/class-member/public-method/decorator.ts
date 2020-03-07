import {NodePath} from '@babel/core';
import {
  assignmentExpression,
  blockStatement,
  callExpression,
  ClassMethod,
  classMethod,
  expressionStatement,
  identifier,
  memberExpression,
  thisExpression,
} from '@babel/types';
import {DecorableClass} from '../../../../src/utils';

const bind: PropertyDecorator = ((
  _: NodePath<DecorableClass>,
  property: NodePath<ClassMethod>,
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
