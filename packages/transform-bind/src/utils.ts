import ASTDecoratorsError from '@ast-decorators/utils/lib/ASTDecoratorsError';
import {ClassMember} from '@ast-decorators/utils/lib/common';
import {isClassMethod, isClassPrivateMethod} from '@babel/types';

export type TransformBindOptions = Readonly<{
  transformerPath?: string;
}>;

export const assert = (decorator: string, member: ClassMember): void => {
  if (!isClassMethod(member) && !isClassPrivateMethod(member)) {
    throw new ASTDecoratorsError(
      `Applying @${decorator} decorator to something other than method is not allowed`,
    );
  }
};
