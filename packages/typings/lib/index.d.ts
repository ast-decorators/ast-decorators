import {
  ClassDeclaration,
  ClassExpression,
  ClassMethod,
  ClassPrivateMethod,
  ClassPrivateProperty,
  ClassProperty,
} from '@babel/types';

export type DecorableClass = ClassDeclaration | ClassExpression;
export type DecorableClassMember =
  | ClassProperty
  | ClassPrivateProperty
  | ClassMethod
  | ClassPrivateMethod;
