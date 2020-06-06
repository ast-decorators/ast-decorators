// TODO: remove eslint-disable when typescript-eslint can handle TS 3.8 properly
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {NodePath} from '@babel/traverse';
import {
  Decorator,
  Identifier,
  isCallExpression,
  MemberExpression,
} from '@babel/types';
import extractImportMetadata, {ImportMetadata} from './extractImportMetadata';

export type DecoratorMetadata = ImportMetadata &
  Readonly<{
    args: readonly NodePath[];
    isCall: boolean;
    remove: () => void;
  }>;

const extractDecoratorMetadata = (
  decorator: NodePath<Decorator>,
): DecoratorMetadata => {
  const expression = decorator.get('expression');
  const isCall = isCallExpression(expression);

  let memberOrIdentifier: NodePath<MemberExpression> | NodePath<Identifier>;
  let args: readonly NodePath[];

  if (isCall) {
    args = expression.get('arguments') as readonly NodePath[];
    memberOrIdentifier = expression.get('callee') as
      | NodePath<MemberExpression>
      | NodePath<Identifier>;
  } else {
    args = [];
    memberOrIdentifier = expression as
      | NodePath<MemberExpression>
      | NodePath<Identifier>;
  }

  return {
    ...extractImportMetadata(memberOrIdentifier),
    args,
    isCall,
    remove: decorator.remove.bind(decorator),
  };
};

export default extractDecoratorMetadata;
