import {DecorableClass} from '@ast-decorators/typings';
import {template} from '@babel/core';
import {NodePath} from '@babel/traverse';
import {
  cloneNode,
  Identifier,
  ObjectExpression,
  Statement,
  StringLiteral,
} from '@babel/types';

export type ElementDecoratorOptions = {
  extends: string;
};

export type ElementDecorator = (
  name: string,
  options?: ElementDecoratorOptions,
) => ClassDecorator;

export const element: ElementDecorator = ((
  name: NodePath<StringLiteral>,
  options?: NodePath<ObjectExpression>,
) => (klass: NodePath<DecorableClass>) => {
  const {scope} = klass.parentPath;

  const customElementTpl = template(
    'const {extends: VAR} = OPTIONS;\ncustomElements.define(NAME, {extends: VAR})',
  );

  const customElementNodes = customElementTpl({
    NAME: cloneNode(((name as unknown) as NodePath<Identifier>).node),
    OPTIONS: cloneNode(
      ((options as unknown) as NodePath<ObjectExpression>).node,
    ),
    VAR: scope.generateUidIdentifier(),
  }) as Statement[];

  klass.replaceWithMultiple([cloneNode(klass.node), ...customElementNodes]);
}) as any;
