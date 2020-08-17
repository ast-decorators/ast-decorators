import type {ASTCallableDecorator} from '@ast-decorators/utils/lib/common';
import hoistFunctionParameter from '@ast-decorators/utils/lib/hoistFunctionParameter';
import type {NodePath} from '@babel/traverse';
import {
  ArrayPattern,
  AssignmentExpression,
  assignmentExpression,
  blockStatement,
  callExpression,
  ExpressionStatement,
  expressionStatement,
  Identifier,
  isMethod,
  ObjectPattern,
} from '@babel/types';
import {basicSetter} from './basics';
import {createAccessorDecorator} from './createAccessorDecorator';
import {
  AccessorInterceptorNode,
  AccessorMethodCreator,
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
//     THE_ACTUAL_ASSIGNMENT_HAPPENS_SOMEWHERE_HERE(value);
//   }
//
// Transformed:
//
//   set foo(value) {
//     value = set(value, this); // interceptor function
//
//     THE_ACTUAL_ASSIGNMENT_HAPPENS_SOMEWHERE_HERE(value);
//   }
export const setter: AccessorMethodCreator = (
  klass,
  member,
  interceptor,
  storageProperty,
  options,
) => {
  const method = basicSetter(klass, member, storageProperty, options);

  if (!interceptor) {
    return [method, []];
  }

  const [interceptorId, interceptorDeclaration] = hoistFunctionParameter(
    interceptor.node,
    'set',
    klass.parentPath.scope,
  );

  if (isMethod(member.node)) {
    const [rawValue] = method.params;

    const [valueId, valueSupportDeclaration] = unifyValueParameter(
      member.scope,
      // There is no reason to set the default value to value parameter
      rawValue as Identifier | ArrayPattern | ObjectPattern,
    );

    method.params = [valueId];

    method.body = blockStatement([
      expressionStatement(
        assignmentExpression(
          '=',
          valueId,
          callExpression(interceptorId, [valueId]),
        ),
      ),
      ...(valueSupportDeclaration ? [valueSupportDeclaration] : []),
      ...method.body.body,
    ]);
  } else {
    // Update default setter body to reduce code size
    const {left, right} = (method.body.body[0] as ExpressionStatement)
      .expression as AssignmentExpression;

    method.body = blockStatement([
      expressionStatement(
        assignmentExpression('=', left, callExpression(interceptorId, [right])),
      ),
    ]);
  }

  return [method, interceptorDeclaration ? [interceptorDeclaration] : []];
};

export const setterTransformer: ASTCallableDecorator<
  [NodePath<AccessorInterceptorNode>?],
  TransformAccessorOptions
> = (set) => createAccessorDecorator('setter', set, setter);
