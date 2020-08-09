import template from '@babel/template';
import {
  BlockStatement,
  identifier,
  Identifier,
  isIdentifier,
  isThisExpression,
  isVariableDeclaration,
  VariableDeclaration,
} from '@babel/types';
import {NodePath, Scope} from '@babel/traverse';

const thisDeclarationTemplate = template('const THIS = this');

export const findThisBindingIndex = (body: BlockStatement): number | null => {
  for (let i = 0; i < body.body.length; i++) {
    const statement = body.body[i];

    if (!isVariableDeclaration(statement)) {
      continue;
    }

    for (const {id, init} of statement.declarations) {
      if (isThisExpression(init) && isIdentifier(id)) {
        return i;
      }
    }
  }

  return null;
};

export const findThisBinding = (body: BlockStatement): Identifier | null => {
  for (const statement of body.body) {
    if (!isVariableDeclaration(statement)) {
      continue;
    }

    for (const {id, init} of statement.declarations) {
      if (isThisExpression(init) && isIdentifier(id)) {
        return id;
      }
    }
  }

  return null;
};

export const createThisBinding = (
  scope?: Scope,
): [Identifier, VariableDeclaration] => {
  const thisId = scope?.generateUidIdentifier('this') ?? identifier('_this');
  const thisDeclaration = thisDeclarationTemplate({
    THIS: thisId,
  }) as VariableDeclaration;

  return [thisId, thisDeclaration];
};

export const findOrCreateThisBinding = (
  body: NodePath<BlockStatement>,
): [Identifier, VariableDeclaration?] => {
  const thisId = findThisBinding(body.node);

  return thisId ? [thisId] : createThisBinding(body.scope);
};
