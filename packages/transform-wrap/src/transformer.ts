import type {
  ASTDecoratorDetector,
  ASTDecoratorTransformer,
} from '@ast-decorators/utils/lib/common';
import type {NodePath} from '@babel/core';
import minimatch from 'minimatch';
import {wrapTransformer} from './wrap';
import type {AllowedWrappers, TransformWrapOptions} from './utils';

export const TRANSFORMER_NAME = '@ast-decorators/transform-wrap';

const detector = (
  decoratorName: string,
  transformerName: string = TRANSFORMER_NAME,
): ASTDecoratorDetector => (name: string, path: string): boolean =>
  name === decoratorName && minimatch(path, transformerName);

const transformer: ASTDecoratorTransformer<
  [NodePath<AllowedWrappers>],
  TransformWrapOptions
> = (_, {transformerPath}: TransformWrapOptions = {}) => [
  [wrapTransformer, detector('wrap', transformerPath)] as const,
];

export default transformer;
