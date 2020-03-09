import {DecorableClassMember} from '@ast-decorators/typings';
import {
  isClassPrivateMethod,
  isClassPrivateProperty,
  isIdentifier,
  isNumericLiteral,
  isStringLiteral,
} from '@babel/types';

const getMemberName = (
  node: DecorableClassMember,
): string | number | undefined => {
  if (isClassPrivateProperty(node) || isClassPrivateMethod(node)) {
    return node.key.id.name;
  }

  return isIdentifier(node.key)
    ? node.key.name
    : isStringLiteral(node.key) || isNumericLiteral(node.key)
    ? node.key.value
    : undefined;
};

export default getMemberName;