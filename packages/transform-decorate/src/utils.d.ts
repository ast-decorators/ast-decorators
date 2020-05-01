import {
  ArrowFunctionExpression,
  FunctionExpression,
  Identifier,
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
