/* eslint-disable max-params */
import {
  BlockStatement,
  classMethod as _classMethod,
  ClassMethod,
  classPrivateMethod as _classPrivateMethod,
  ClassPrivateMethod,
  ClassPrivateProperty,
  classPrivateProperty as _classPrivateProperty,
  cloneNode as _cloneNode,
  Decorator,
  Expression,
  Identifier,
  isClassPrivateProperty,
  Node,
  Noop,
  NumericLiteral,
  Pattern,
  PrivateName,
  RestElement,
  StringLiteral,
  TSParameterProperty,
  TSTypeAnnotation,
  TypeAnnotation,
} from '@babel/types';

export const cloneNode = <T extends Node>(
  node: T,
  deep?: boolean,
  withoutLoc?: boolean,
): T => {
  const cloned = _cloneNode(node, deep, withoutLoc);

  if (isClassPrivateProperty(node)) {
    // @ts-expect-error: Babel d.ts file does not include "static" for
    // ClassPrivateProperty and ClassPrivateMethod.
    cloned.static = node.static;
  }

  return cloned;
};

export const classMethod = (
  kind: 'get' | 'set' | 'method' | 'constructor' | undefined,
  key: Identifier | StringLiteral | NumericLiteral | Expression,
  params: Array<Identifier | Pattern | RestElement | TSParameterProperty>,
  body: BlockStatement,
  decorators?: Decorator[] | null,
  computed?: boolean,
  _static?: boolean,
  generator?: boolean,
  async?: boolean,
): ClassMethod => {
  const node = _classMethod(
    kind,
    key,
    params,
    body,
    computed,
    _static,
    generator,
    async,
  );

  if (decorators !== undefined) {
    node.decorators = decorators;
  }

  return node;
};

export const classPrivateProperty = (
  key: PrivateName,
  value?: Expression | null,
  typeAnnotation?: TypeAnnotation | TSTypeAnnotation | Noop | null,
  decorators?: Decorator[] | null,
  _static?: boolean,
): ClassPrivateProperty => {
  const node = _classPrivateProperty(key, value, decorators);

  if (typeAnnotation) {
    // @ts-expect-error: Babel d.ts file does not include "typeAnnotation" for
    // ClassPrivateProperty.
    node.typeAnnotation = typeAnnotation;
  }

  if (_static) {
    // @ts-expect-error: Babel d.ts file does not include "static" for
    // ClassPrivateProperty.
    node.static = _static;
  }

  return node;
};

export const classPrivateMethod = (
  kind: 'get' | 'set' | 'method' | 'constructor' | undefined,
  key: PrivateName,
  params: Array<Identifier | Pattern | RestElement | TSParameterProperty>,
  body: BlockStatement,
  decorators?: Decorator[] | null,
  _static?: boolean,
  generator?: boolean,
  async?: boolean,
): ClassPrivateMethod => {
  const node = _classPrivateMethod(kind, key, params, body, _static);

  if (decorators !== undefined) {
    node.decorators = decorators;
  }

  if (generator) {
    node.generator = generator;
  }

  if (async) {
    node.async = async;
  }

  return node;
};
