import {
  ASTDecoratorDetector,
  ASTDecoratorTransformer,
} from '@ast-decorators/utils/lib/common';
import minimatch from 'minimatch';
import {decorateTransformer} from './decorate';
import {TransformBindOptions} from './utils';

export const TRANSFORMER_NAME = '@ast-decorators/transform-decorate';

const detector = (
  decoratorName: string,
  transformerName: string = TRANSFORMER_NAME,
): ASTDecoratorDetector => (name: string, path: string): boolean =>
  name === decoratorName && minimatch(path, transformerName);

const transformer: ASTDecoratorTransformer = (
  _,
  {transformerPath}: TransformBindOptions = {},
) => [[decorateTransformer, detector('decorate', transformerPath)] as const];

export default transformer;
