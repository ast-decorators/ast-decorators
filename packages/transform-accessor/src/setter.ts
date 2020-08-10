import type {ASTCallableDecorator} from '@ast-decorators/utils/lib/common';
import {
  createThisBinding,
  findThisBinding,
  findThisBindingIndex,
} from '@ast-decorators/utils/lib/thisBindingUtils';
import {ClassMemberMethod} from '@ast-decorators/utils/src/common';
import type {NodePath} from '@babel/traverse';
import {
  ArrayPattern,
  assignmentExpression,
  BlockStatement,
  blockStatement,
  callExpression,
  classMethod,
  classPrivateMethod,
  Decorator,
  expressionStatement,
  FunctionDeclaration,
  identifier,
  Identifier,
  isClassPrivateProperty,
  isMethod,
  memberExpression,
  NumericLiteral,
  ObjectPattern,
  Pattern,
  PrivateName,
  Statement,
  StringLiteral,
  VariableDeclaration,
} from '@babel/types';
import {
  AccessorInterceptorNode,
  AccessorMethodCreator,
  createAccessorDecorator,
  ownerNode,
  prepareInterceptor,
  TransformAccessorOptions,
  unifyValueParameter,
} from './utils';

// For properties, setter decorator creates a set method with a call to set the
// interceptor function.
// For methods, it puts the call to set the interceptor function before any
// user-defined content. It works this way because we cannot actually understand
// where the actual assignment happens and if it even happens at all. The only
// thing we can do is to work with the "value" parameter.
//
// Original:
//
//   @setter(set)
//   set foo(value) {
//     THE ACTUAL ASSIGNMENT HAPPENS SOMEWHERE HERE;
//   }
//
// Transformed
//
//   set foo(value) {
//     value = set(value, this); // interceptor function
//
//     THE ACTUAL ASSIGNMENT HAPPENS SOMEWHERE HERE;
//   }
export const setter: AccessorMethodCreator = (
  klass,
  member,
  interceptor,
  storageProperty,
  {preservingDecorators, useClassName},
) => {
  const declarations: Array<FunctionDeclaration | VariableDeclaration> = [];

  const [interceptorId, interceptorDeclaration] = interceptor
    ? prepareInterceptor(klass, interceptor.node, 'set')
    : [];

  if (interceptorDeclaration) {
    declarations.push(interceptorDeclaration);
  }

  let params: ClassMemberMethod['params'];
  let newBody: BlockStatement;

  if (isMethod(member.node)) {
    if (!interceptorId) {
      return null;
    }

    const [rawValue] = member.get('params') as ReadonlyArray<
      NodePath<Identifier | Pattern>
    >;

    const [valueId, valueSupportDeclaration] = unifyValueParameter(
      member.scope,
      // There is no reason to set the default value to value parameter
      rawValue.node as Identifier | ArrayPattern | ObjectPattern,
    );

    params = [valueId];

    const body = member.get('body') as NodePath<BlockStatement>;

    // Unlike the getter decorator, in the setter, the user-defined content is
    // placed below the decorator-produced one. So, we cannot easily use the
    // user-defined "this" binding if it exists. The only thing we can do is to
    // check if the first statement contains "this" binding. If it does, we use
    // it; otherwise, we create our own.
    const hasThisBindingDeclarationOnTop =
      findThisBindingIndex(body.node) === 0;

    let originalBody: Statement[];
    let topThisDeclaration: Statement;
    let thisId: Identifier;

    if (hasThisBindingDeclarationOnTop) {
      originalBody = body.node.body.slice(1);
      [topThisDeclaration] = body.node.body;
      thisId = findThisBinding(body.node)!;
    } else {
      originalBody = body.node.body;
      [thisId, topThisDeclaration] = createThisBinding(body.scope);
    }

    newBody = blockStatement([
      topThisDeclaration,
      expressionStatement(
        assignmentExpression(
          '=',
          valueId,
          callExpression(interceptorId, [valueId, thisId]),
        ),
      ),
      ...(valueSupportDeclaration ? [valueSupportDeclaration] : []),
      ...originalBody,
    ]);
  } else {
    const [thisId, thisDeclaration] = createThisBinding();

    const valueId = identifier('value');
    params = [valueId];

    const property = memberExpression(
      ownerNode(klass.node, useClassName),
      storageProperty!,
    );

    const assignment = expressionStatement(
      assignmentExpression(
        '=',
        property,
        interceptorId
          ? callExpression(interceptorId, [valueId, thisId])
          : valueId,
      ),
    );

    newBody = blockStatement([thisDeclaration, assignment]);
  }

  // @ts-expect-error: "computed" do not exist on the ClassMemberProperty (it
  // will simply be undefined) and "static" is not listed in d.ts
  const {computed, key, static: _static} = member.node;

  const method = isClassPrivateProperty(member)
    ? classPrivateMethod('set', key as PrivateName, params, newBody, _static)
    : classMethod(
        'set',
        key as Identifier | StringLiteral | NumericLiteral,
        params,
        newBody,
        computed,
        _static,
      );

  method.decorators = preservingDecorators as Decorator[];

  return [method, declarations];
};

export const setterTransformer: ASTCallableDecorator<
  [NodePath<AccessorInterceptorNode>?],
  TransformAccessorOptions
> = set => createAccessorDecorator('setter', set, setter);
