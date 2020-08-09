import type {ASTCallableDecorator} from '@ast-decorators/utils/lib/common';
import {
  createThisBinding,
  findOrCreateThisBinding,
} from '@ast-decorators/utils/lib/useThisBinding';
import type {NodePath} from '@babel/traverse';
import {
  assignmentExpression,
  BlockStatement,
  blockStatement,
  callExpression,
  classMethod,
  classPrivateMethod,
  Decorator,
  ExpressionStatement,
  expressionStatement,
  FunctionDeclaration,
  identifier,
  Identifier,
  isClassPrivateProperty,
  isIdentifier,
  isMethod,
  memberExpression,
  NumericLiteral,
  PrivateName,
  ReturnStatement,
  returnStatement,
  StringLiteral,
  variableDeclaration,
  VariableDeclaration,
  variableDeclarator,
} from '@babel/types';
import {
  AccessorInterceptorNode,
  AccessorMethodCreator,
  createAccessorDecorator,
  ownerNode,
  prepareInterceptor,
  TransformAccessorOptions,
} from './utils';

const resultKey = 'binding:result-var';

const prepareResult = (
  body: NodePath<BlockStatement>,
): [Identifier, (VariableDeclaration | ExpressionStatement)?] => {
  const {argument} = body.node.body[
    body.node.body.length - 1
  ] as ReturnStatement;

  if (isIdentifier(argument)) {
    return [argument];
  }

  const member = body.parentPath;
  const data: Identifier | undefined = member.getData(resultKey);

  if (data) {
    return [
      data,
      expressionStatement(
        assignmentExpression('=', data, argument ?? identifier('undefined')),
      ),
    ];
  }

  const resultId = body.scope.generateUidIdentifier('result');
  const resultDeclaration = variableDeclaration('let', [
    variableDeclarator(resultId, argument),
  ]);

  member.setData(resultKey, resultId);

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
//     const RESULT = DO SOMETHING;
//     return RESULT;
//   }
//
// Transformed
//
//   get foo() {
//     const RESULT = DO SOMETHING;
//     const _result = get(RESULT, this); // interceptor function
//
//     return _result;
//   }
export const getter: AccessorMethodCreator = (
  klass,
  member,
  interceptor,
  storageProperty,
  {preservingDecorators, useClassName},
) => {
  const declarations: Array<FunctionDeclaration | VariableDeclaration> = [];

  const [interceptorId, interceptorDeclaration] = interceptor
    ? prepareInterceptor(klass, interceptor.node, 'get')
    : [];

  if (interceptorDeclaration) {
    declarations.push(interceptorDeclaration);
  }

  let newBody: BlockStatement;

  if (isMethod(member.node)) {
    if (!interceptorId) {
      return null;
    }

    const body = member.get('body') as NodePath<BlockStatement>;

    const originalBody = body.node.body.slice(0, -1);

    const [thisBinding, thisBindingDeclaration] = findOrCreateThisBinding(body);
    const [resultId, resultDeclaration] = prepareResult(body);

    newBody = blockStatement([
      ...(thisBindingDeclaration ? [thisBindingDeclaration] : []),
      ...originalBody,
      ...(resultDeclaration ? [resultDeclaration] : []),
      returnStatement(callExpression(interceptorId, [resultId, thisBinding])),
    ]);
  } else {
    const [thisId, thisDeclaration] = createThisBinding();

    const property = memberExpression(
      ownerNode(klass.node, useClassName),
      storageProperty!,
    );

    const result = interceptorId
      ? callExpression(interceptorId, [property, thisId])
      : property;

    newBody = blockStatement([
      ...(interceptorId ? [thisDeclaration] : []),
      returnStatement(result),
    ]);
  }

  // @ts-expect-error: "computed" do not exist on the ClassMemberProperty (it
  // will simply be undefined) and "static" is not listed in d.ts
  const {computed, key, static: _static} = member.node;

  const method = isClassPrivateProperty(member)
    ? classPrivateMethod('get', key as PrivateName, [], newBody, _static)
    : classMethod(
        'get',
        key as Identifier | StringLiteral | NumericLiteral,
        [],
        newBody,
        computed,
        _static,
      );

  method.decorators = preservingDecorators as Decorator[];

  return [method, declarations];
};

export const getterTransformer: ASTCallableDecorator<
  [NodePath<AccessorInterceptorNode>?],
  TransformAccessorOptions
> = get => createAccessorDecorator('getter', get, getter);
