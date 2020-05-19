import {
  ASTDecoratorDetector,
  ASTDecoratorTransformer,
  ClassMemberMethod,
} from '@ast-decorators/utils/lib/common';
import minimatch from 'minimatch';
import {bindTransformer} from './bind';
import {bindAllTransformer} from './bindAll';
import {TransformBindOptions} from './utils';

export const TRANSFORMER_NAME = '@ast-decorators/transform-accessor';

const detector = (
  decoratorName: string,
  transformerName: string = TRANSFORMER_NAME,
): ASTDecoratorDetector => (name: string, path: string): boolean =>
  name === decoratorName && minimatch(path, transformerName);

const transformer: ASTDecoratorTransformer<
  [],
  TransformBindOptions,
  ClassMemberMethod
> = (_, {transformerPath}: TransformBindOptions = {}) => [
  [bindTransformer, detector('bind', transformerPath)] as const,
  [bindAllTransformer, detector('bindAll', transformerPath)] as const,
];

export default transformer;
