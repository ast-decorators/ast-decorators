import {cloneNode} from '@ast-decorators/utils/lib/babelFixes';
import type {
  ASTCallableDecorator,
  ClassMember,
  ClassMemberProperty,
} from '@ast-decorators/utils/lib/common';
import hoistFunctionParameter from '@ast-decorators/utils/lib/hoistFunctionParameter';
import {ClassMemberMethod} from '@ast-decorators/utils/src/common';
import type {NodePath, Scope} from '@babel/traverse';
import {
  ArrayPattern,
  blockStatement,
  callExpression,
  Class,
  Decorator,
  expressionStatement,
  Identifier,
  isMethod,
  isProperty,
  MemberExpression,
  ObjectPattern,
  PrivateName,
  thisExpression,
} from '@babel/types';
import {basicGetter, basicSetter} from './basics';
import {
  AccessorInterceptorNode,
  applyChanges,
  assert,
  createStorage,
  prepareSetterDecorators,
  TransformAccessorOptions,
  TwinAccessorOptions,
  TwinAccessorTransformedNode,
  unifyValueParameter,
} from './utils';

const addTracker = (
  method: ClassMemberMethod,
  track: Identifier | MemberExpression | undefined,
  scope: Scope,
) => {
  if (track) {
    const [rawValue] = method.params;

    const [valueId, valueSupportDeclaration] = unifyValueParameter(
      scope,
      // There is no reason to set the default value to value parameter
      rawValue as Identifier | ArrayPattern | ObjectPattern,
    );

    method.body = blockStatement([
      ...(valueSupportDeclaration ? [valueSupportDeclaration] : []),
      ...method.body.body,
      expressionStatement(callExpression(track, [thisExpression(), valueId])),
    ]);
  }

  return method;
};

export const tracked = (
  klass: NodePath<Class>,
  member: NodePath<ClassMember>,
  interceptor: NodePath<AccessorInterceptorNode> | undefined,
  {
    privacy,
    useClassNameForStatic,
    ...decoratorsPreparationOptions
  }: TwinAccessorOptions,
): TwinAccessorTransformedNode => {
  const isMemberProperty = isProperty(member.node);

  const decorators = member.node.decorators
    ? (member.get('decorators') as ReadonlyArray<NodePath<Decorator>>)
    : null;

  const useClassName = 'static' in member.node && !!useClassNameForStatic;

  const storage = isMemberProperty
    ? createStorage(klass, member.node as ClassMemberProperty, privacy)
    : undefined;

  const [trackId, trackDeclaration] = interceptor
    ? hoistFunctionParameter(interceptor.node, 'track', klass.parentPath.scope)
    : [];

  const getter = isMemberProperty
    ? basicGetter(
        klass,
        member,
        storage?.key as Identifier | PrivateName | undefined,
        {
          preservingDecorators: decorators?.map(({node}) => node) ?? null,
          useClassName,
        },
      )
    : undefined;

  const setterPreservedDecorators = decorators
    ? prepareSetterDecorators(decorators, decoratorsPreparationOptions)
        // We need to add decorator nodes to binding registry only if we create two
        // nodes (getter and setter) instead of one (property).
        .map(({node}) => (isMemberProperty ? cloneNode(node) : node))
    : null;

  const setter =
    isMemberProperty || (isMethod(member.node) && member.node.kind === 'set')
      ? addTracker(
          basicSetter(
            klass,
            member,
            storage?.key as Identifier | PrivateName | undefined,
            {
              preservingDecorators: setterPreservedDecorators,
              useClassName,
            },
          ),
          trackId,
          member.scope,
        )
      : undefined;

  return [
    [getter],
    [setter, trackDeclaration ? [trackDeclaration] : undefined],
    storage,
  ];
};

export const trackedTransformer: ASTCallableDecorator<
  [NodePath<AccessorInterceptorNode>?],
  TransformAccessorOptions
> = (interceptor) => (
  {klass, member},
  options: TransformAccessorOptions = {},
  {filename},
) => {
  assert('tracked', member!.node, [interceptor?.node]);

  applyChanges(
    klass,
    member!,
    tracked(klass, member!, interceptor, {...options, filename}),
  );
};
