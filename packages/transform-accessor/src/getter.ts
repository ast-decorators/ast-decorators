import type {ASTCallableDecorator} from '@ast-decorators/utils/lib/common';
import hoistFunctionParameter from '@ast-decorators/utils/lib/hoistFunctionParameter';
import type {NodePath} from '@babel/traverse';
import {
  assignmentExpression,
  BlockStatement,
  blockStatement,
  callExpression,
  ExpressionStatement,
  expressionStatement,
  identifier,
  Identifier,
  isIdentifier,
  isMethod,
  ReturnStatement,
  returnStatement,
  variableDeclaration,
  VariableDeclaration,
  variableDeclarator,
} from '@babel/types';
import {basicGetter} from './basics';
import {createAccessorDecorator} from './createAccessorDecorator';
import {
  AccessorInterceptorNode,
  AccessorMethodCreator,
  TransformAccessorOptions,
} from './utils';

const resultKey = 'binding:result-var';

const prepareResult = (
  body: BlockStatement,
  path?: NodePath<any>,
): [Identifier, (VariableDeclaration | ExpressionStatement)?] => {
  const {argument} = body.body[body.body.length - 1] as ReturnStatement;

  if (isIdentifier(argument)) {
    return [argument];
  }

  const data: Identifier | undefined = path?.getData(resultKey);

  if (data) {
    return [
      data,
      expressionStatement(
        assignmentExpression('=', data, argument ?? identifier('undefined')),
      ),
    ];
  }

  const resultId =
    path?.scope.generateUidIdentifier('result') ?? identifier('_result');
  const resultDeclaration = variableDeclaration('let', [
    variableDeclarator(resultId, argument),
  ]);

  path?.setData(resultKey, resultId);

  return [resultId, resultDeclaration];
};

// For properties, getter decorator creates a get method with a call to get
// interceptor function.
// For methods, it puts a call to the interceptor function between the existing
// code and the return statement.
//
// Original:
//
//   @getter(get)
//   get foo() {
//     return SOMETHING;
//   }
//
// Transformed
//
//   get foo() {
//     const _result = get(SOMETHING, this); // interceptor function
//
//     return _result;
//   }
export const getter: AccessorMethodCreator = (
  klass,
  member,
  interceptor,
  storageProperty,
  options,
) => {
  const method = basicGetter(klass, member, storageProperty, options);

  if (!interceptor) {
    return [method, []];
  }

  const [interceptorId, interceptorDeclaration] = hoistFunctionParameter(
    interceptor.node,
    'get',
    klass.parentPath.scope,
  );

  if (isMethod(member.node)) {
    const originalBody = method.body.body.slice(0, -1);
    const [resultId, resultDeclaration] = prepareResult(
      method.body,
      isMethod(member.node) ? member : undefined,
    );

    method.body = blockStatement([
      ...originalBody,
      ...(resultDeclaration ? [resultDeclaration] : []),
      returnStatement(callExpression(interceptorId, [resultId])),
    ]);
  } else {
    // Update default getter body to reduce code size
    const {argument} = method.body.body[0] as ReturnStatement;

    method.body = blockStatement([
      returnStatement(callExpression(interceptorId, [argument!])),
    ]);
  }

  return [method, interceptorDeclaration ? [interceptorDeclaration] : []];
};

export const getterTransformer: ASTCallableDecorator<
  [NodePath<AccessorInterceptorNode>?],
  TransformAccessorOptions
> = (get) => createAccessorDecorator('getter', get, getter);
