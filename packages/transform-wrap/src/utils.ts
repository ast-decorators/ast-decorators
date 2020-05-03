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

export type TransformWrapOptions = Readonly<{
  transformerPath?: string;
}>;

export type AllowedWrappers =
  | FunctionExpression
  | ArrowFunctionExpression
  | Identifier
  | MemberExpression;

export const assertWrap = (
  wrapperFunction: AllowedWrappers | undefined,
  member: ClassMemberMethod,
): void => {
  if (!wrapperFunction) {
    const methodName = getMemberName(member);

    throw new ASTDecoratorsError(
      `@wrap: No wrapper function provided${
        methodName !== undefined ? ` for ${methodName}` : ''
      }`,
    );
  }

  if (
    (isClassProperty(member) || isClassPrivateProperty(member)) &&
    (!member.value || isLiteral(member.value))
  ) {
    throw new ASTDecoratorsError(
      `@wrap can only be applied to class methods or properties with ` +
        'functions assigned',
    );
  }
};
