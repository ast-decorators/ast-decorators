import {
  ClassProperty,
  isIdentifier,
  isLiteral,
  isPrivate,
  NumericLiteral,
  StringLiteral,
} from '@babel/types';
import {ClassMember} from './common';

const getMemberName = (member: ClassMember): string | number | undefined => {
  const memberId: ClassProperty['key'] = isPrivate(member)
    ? member.key.id
    : member.key;

  return isIdentifier(memberId)
    ? memberId.name
    : isLiteral(memberId)
    ? (memberId as StringLiteral | NumericLiteral).value
    : undefined;
};

export default getMemberName;
