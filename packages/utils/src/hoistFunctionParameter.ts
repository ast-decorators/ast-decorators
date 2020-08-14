import template from '@babel/template';
import type {Scope} from '@babel/traverse';
import {
  ArrowFunctionExpression,
  functionDeclaration,
  FunctionDeclaration,
  FunctionExpression,
  Identifier,
  isArrowFunctionExpression,
  isFunctionExpression,
  MemberExpression,
  VariableDeclaration,
} from '@babel/types';

export type FunctionParameter =
  | FunctionExpression
  | ArrowFunctionExpression
  | Identifier
  | MemberExpression;

const declarator = template(`const VAR = FUNCTION`);

const hoistFunctionParameter = (
  fn: FunctionParameter,
  name: string,
  scope: Scope,
): readonly [
  Identifier | MemberExpression,
  FunctionDeclaration | VariableDeclaration | undefined,
] => {
  const isArrow = isArrowFunctionExpression(fn);
  const isRegular = isFunctionExpression(fn);

  const interceptorId =
    isArrow || isRegular
      ? scope.generateUidIdentifier(name)
      : (fn as Identifier | MemberExpression);

  return [
    interceptorId,
    isArrow
      ? (declarator({
          FUNCTION: fn,
          VAR: interceptorId as Identifier,
        }) as VariableDeclaration)
      : isRegular
      ? functionDeclaration(
          interceptorId as Identifier,
          (fn as FunctionExpression).params,
          (fn as FunctionExpression).body,
        )
      : undefined,
  ];
};

export default hoistFunctionParameter;
