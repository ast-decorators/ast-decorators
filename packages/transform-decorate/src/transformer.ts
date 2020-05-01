import type {
  ASTDecoratorDetector,
  ASTDecoratorTransformer,
  ClassMemberMethod,
} from '@ast-decorators/utils/lib/common';
import type {NodePath} from '@babel/core';
import minimatch from 'minimatch';
import {decorateTransformer} from './decorate';
import type {AllowedDecorators, TransformDecorateOptions} from './utils';

export const TRANSFORMER_NAME = '@ast-decorators/transform-decorate';

const detector = (
  decoratorName: string,
  transformerName: string = TRANSFORMER_NAME,
): ASTDecoratorDetector => (name: string, path: string): boolean =>
  name === decoratorName && minimatch(path, transformerName);

const transformer: ASTDecoratorTransformer<
  [NodePath<AllowedDecorators>],
  TransformDecorateOptions,
  ClassMemberMethod
> = (_, {transformerPath}: TransformDecorateOptions = {}) => [
  [decorateTransformer, detector('decorate', transformerPath)] as const,
];

export default transformer;
