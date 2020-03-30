import {
  ASTDecoratorDetector,
  ASTDecoratorTransformer,
} from '@ast-decorators/utils/lib/common';
import minimatch from 'minimatch';
import bind from './bind';
import bindAll from './bindAll';
import {TransformBindOptions} from './utils';

export const TRANSFORMER_NAME = '@ast-decorators/transform-bind';

const detector = (
  decoratorName: string,
  transformerName: string = TRANSFORMER_NAME,
): ASTDecoratorDetector => (name: string, path: string): boolean =>
  name === decoratorName && minimatch(path, transformerName);

const transformer: ASTDecoratorTransformer = (
  _,
  {transformerPath}: TransformBindOptions = {},
) => [
  [bind, detector('bind', transformerPath)] as const,
  [bindAll, detector('bindAll', transformerPath)] as const,
];

export default transformer;
