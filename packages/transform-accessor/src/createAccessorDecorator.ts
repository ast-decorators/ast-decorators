import type {ASTSimpleDecorator} from '@ast-decorators/utils/lib/common';
import type {NodePath} from '@babel/traverse';
import {
  FunctionDeclaration,
  Identifier,
  isProperty,
  PrivateName,
  VariableDeclaration,
} from '@babel/types';
import {
  AccessorInterceptorNode,
  AccessorMethodCreator,
  assert,
  createStorage,
  TransformAccessorOptions,
} from './utils';

export const createAccessorDecorator = (
  decorator: string,
  interceptor: NodePath<AccessorInterceptorNode> | undefined,
  impl: AccessorMethodCreator,
): ASTSimpleDecorator<TransformAccessorOptions> => (
  {klass, member},
  {privacy, useClassNameForStatic}: TransformAccessorOptions = {},
): void => {
  assert(decorator, member!.node, [interceptor?.node]);

  const storage = isProperty(member!.node)
    ? createStorage(klass, member!.node, privacy)
    : undefined;

  const result = impl(
    klass,
    member!,
    interceptor,
    storage?.key as Identifier | PrivateName | undefined,
    {
      preservingDecorators: member!.node.decorators,
      // @ts-expect-error: "static" is not listed in d.ts
      useClassName: !!member.node.static && !!useClassNameForStatic,
    },
  );

  const [method, declarations] = result;

  if (declarations) {
    klass.insertBefore(
      declarations as Array<FunctionDeclaration | VariableDeclaration>,
    );
  }

  if (storage) {
    member!.insertBefore(storage);
  }

  if (method) {
    member!.replaceWith(method);
  }
};
