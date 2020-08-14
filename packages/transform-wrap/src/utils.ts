import ASTDecoratorsError from '@ast-decorators/utils/lib/ASTDecoratorsError';
import type {ClassMember, PrivacyType} from '@ast-decorators/utils/lib/common';
import {
  ArrowFunctionExpression,
  FunctionExpression,
  Identifier,
  isArrowFunctionExpression,
  isClassPrivateProperty,
  isClassProperty,
  isFunctionExpression,
  isIdentifier,
  isMemberExpression,
  isMethod,
  MemberExpression,
} from '@babel/types';

export type TransformWrapOptions = Readonly<{
  privacy?: PrivacyType;
  transformerPath?: string;
}>;

const isClassPropertyWithFunctionAssigned = (member: ClassMember) =>
  (isClassProperty(member) || isClassPrivateProperty(member)) &&
  member.value &&
  (isFunctionExpression(member.value) ||
    isArrowFunctionExpression(member.value) ||
    isIdentifier(member.value) ||
    isMemberExpression(member.value));

export type AllowedWrappers =
  | FunctionExpression
  | ArrowFunctionExpression
  | Identifier
  | MemberExpression;

export const assertWrap = (member?: ClassMember): void => {
  if (!member) {
    throw new ASTDecoratorsError(
      '@wrap: Allowed for methods and properties only',
    );
  }

  if (!isMethod(member) && !isClassPropertyWithFunctionAssigned(member)) {
    throw new ASTDecoratorsError(
      '@wrap can only be applied to class methods or properties with function assigned',
    );
  }
};
