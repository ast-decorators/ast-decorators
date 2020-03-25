import {NodePath} from '@babel/core';
import {
  assignmentExpression,
  blockStatement,
  callExpression,
  Class,
  ClassBody,
  classMethod,
  ClassProperty,
  cloneNode,
  expressionStatement,
  functionDeclaration,
  FunctionExpression,
  identifier,
  Identifier,
  memberExpression,
  privateName,
  returnStatement,
  thisExpression,
} from '@babel/types';

const observe = (observer: NodePath<FunctionExpression>) => (
  klass: NodePath<Class>,
  property: NodePath<ClassProperty>,
) => {
  const klassBody = klass.get('body') as NodePath<ClassBody>;
  const propertyStringName = (property.node.key as Identifier).name;

  const observerId = klassBody.scope.generateUidIdentifier(
    `${propertyStringName}Observer`,
  );
  const outerObserver = functionDeclaration(
    cloneNode(observerId),
    observer.node.params,
    observer.node.body,
  );

  const privateProperty = privateName(
    klassBody.scope.generateUidIdentifier(propertyStringName),
  );

  const thisPropExpression = memberExpression(
    thisExpression(),
    cloneNode(privateProperty),
  );

  const getter = classMethod(
    'get',
    property.node.key,
    [],
    blockStatement([returnStatement(cloneNode(thisPropExpression))]),
  );

  const valueIdentifier = identifier('value');

  const setter = classMethod(
    'set',
    property.node.key,
    [valueIdentifier],
    blockStatement([
      expressionStatement(
        assignmentExpression(
          '=',
          cloneNode(thisPropExpression),
          valueIdentifier,
        ),
      ),
      expressionStatement(
        callExpression(
          memberExpression(cloneNode(observerId), identifier('call')),
          [thisExpression()],
        ),
      ),
    ]),
  );

  klass.insertBefore(outerObserver);
  property.replaceWithMultiple([privateProperty, getter, setter]);
};

export default () => [[observe, name => name === 'observe']];
