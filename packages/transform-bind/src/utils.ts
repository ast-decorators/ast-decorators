import ASTDecoratorsError from '@ast-decorators/utils/lib/ASTDecoratorsError';
import {ClassMember} from '@ast-decorators/utils/lib/common';
import {isClassMethod, isClassPrivateMethod} from '@babel/types';

export type TransformBindOptions = Readonly<{
  transformerPath?: string;
}>;

export const assertBind = (member: ClassMember): void => {
  if (!isClassMethod(member) && !isClassPrivateMethod(member)) {
    throw new ASTDecoratorsError(
      `Applying @bind decorator to something other than method is not allowed`,
    );
  }
};

export const assertBindAll = (args: any[]): void => {
  if (args.length > 3) {
    throw new ASTDecoratorsError(
      'Applying @bindAll decorator to something other than class is not allowed',
    );
  }
};
