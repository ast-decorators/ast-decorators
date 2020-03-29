import {
  ASTDecoratorDetector,
  ASTDecoratorTransformer,
} from '@ast-decorators/typings';
import minimatch from 'minimatch';
import bindAll from './bindAll';
import {TransformBindOptions} from './utils';
import bind from './bind';

export const TRANSFORMER_NAME = '@ast-decorators/transform-accessor';

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
