import {DecorableClass} from '@ast-decorators/typings';
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

export const bind: PropertyDecorator = ((
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
