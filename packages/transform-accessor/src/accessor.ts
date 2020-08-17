import {cloneNode} from '@ast-decorators/utils/lib/babelFixes';
import type {ASTCallableDecorator} from '@ast-decorators/utils/lib/common';
import {
  ClassMember,
  ClassMemberProperty,
} from '@ast-decorators/utils/src/common';
import type {NodePath} from '@babel/traverse';
import {
  Class,
  Decorator,
  Identifier,
  isMethod,
  isProperty,
  PrivateName,
} from '@babel/types';
import {getter} from './getter';
import {setter} from './setter';
import {
  AccessorInterceptorNode,
  applyChanges,
  assert,
  createStorage,
  prepareSetterDecorators,
  TransformAccessorOptions,
  TransformedNode,
  TwinAccessorOptions,
  TwinAccessorTransformedNode,
} from './utils';

export type AccessorInterceptors = Readonly<{
  get?: NodePath<AccessorInterceptorNode>;
  set?: NodePath<AccessorInterceptorNode>;
}>;

export const accessor = (
  klass: NodePath<Class>,
  member: NodePath<ClassMember>,
  {get, set}: AccessorInterceptors,
  {
    privacy,
    useClassNameForStatic,
    ...decoratorsPreparationOptions
  }: TwinAccessorOptions,
): TwinAccessorTransformedNode => {
  const decorators = member.node.decorators
    ? (member.get('decorators') as ReadonlyArray<NodePath<Decorator>>)
    : null;

  const useClassName = 'static' in member.node && !!useClassNameForStatic;
  const isMemberProperty = isProperty(member.node);

  const storage = isMemberProperty
    ? createStorage(klass, member.node as ClassMemberProperty, privacy)
    : undefined;

  const getterResults: TransformedNode =
    isMemberProperty || (isMethod(member.node) && member.node.kind === 'get')
      ? getter(
          klass,
          member,
          get,
          storage?.key as Identifier | PrivateName | undefined,
          {
            preservingDecorators: decorators?.map(({node}) => node) ?? null,
            useClassName,
          },
        )
      : [];

  const setterPreservedDecorators = decorators
    ? prepareSetterDecorators(decorators, decoratorsPreparationOptions)
        // We need to add decorator nodes to binding registry only if we create two
        // nodes (getter and setter) instead of one (property).
        .map(({node}) => (isMemberProperty ? cloneNode(node) : node))
    : null;

  const setterResults: TransformedNode =
    isMemberProperty || (isMethod(member.node) && member.node.kind === 'set')
      ? setter(
          klass,
          member,
          set,
          storage?.key as Identifier | PrivateName | undefined,
          {
            preservingDecorators: setterPreservedDecorators,
            useClassName,
          },
        )
      : [];

  return [getterResults, setterResults, storage];
};

export const accessorTransformer: ASTCallableDecorator<
  [NodePath<AccessorInterceptorNode>?, NodePath<AccessorInterceptorNode>?],
  TransformAccessorOptions
> = (get, set) => (
  {klass, member},
  options: TransformAccessorOptions = {},
  {filename},
) => {
  assert('accessor', member!.node, [get?.node, set?.node]);

  applyChanges(
    klass,
    member!,
    accessor(klass, member!, {get, set}, {...options, filename}),
  );
};
