import {cloneNode} from '@babel/types';
import {ClassMember} from './common';

export const cloneClassMember = <T extends ClassMember>(node: T): T => {
  const cloned = cloneNode(node);
  // @ts-expect-error: "static" is not listed in d.ts
  cloned.static = node.static;

  return cloned;
};
