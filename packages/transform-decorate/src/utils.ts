import ASTDecoratorsError from '@ast-decorators/utils/lib/ASTDecoratorsError';
import getMemberName from '@ast-decorators/utils/lib/getMemberName';
import type {ClassMemberMethod} from '@ast-decorators/utils/src/common';
import {
  ArrowFunctionExpression,
  FunctionExpression,
  Identifier,
  isClassPrivateProperty,
  isClassProperty,
  isLiteral,
  MemberExpression,
} from '@babel/types';

export type TransformDecorateOptions = Readonly<{
  transformerPath?: string;
}>;

export type AllowedDecorators =
  | FunctionExpression
  | ArrowFunctionExpression
  | Identifier
  | MemberExpression;

export const assertDecorate = (
  decoratorFunction: AllowedDecorators | undefined,
  member: ClassMemberMethod,
): void => {
  if (!decoratorFunction) {
    const methodName = getMemberName(member);

    throw new ASTDecoratorsError(
      `@decorate: No decorator function provided${
        methodName !== undefined ? ` for ${methodName}` : ''
      }`,
    );
  }

  if (
    (isClassProperty(member) || isClassPrivateProperty(member)) &&
    (!member.value || isLiteral(member.value))
  ) {
    throw new ASTDecoratorsError(
      `@decorate can only be applied to class methods or properties with ` +
        'functions assigned',
    );
  }
};
