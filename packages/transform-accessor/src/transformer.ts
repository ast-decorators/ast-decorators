import {
  ASTDecoratorDetector,
  ASTDecoratorTransformer,
} from '@ast-decorators/utils/lib/common';
import minimatch from 'minimatch';
import {accessorTransformer} from './accessor';
import {getterTransformer} from './getter';
import {setterTransformer} from './setter';
import {TransformAccessorOptions} from './utils';

export const TRANSFORMER_NAME = '@ast-decorators/transform-accessor';

const detector = (
  decoratorName: string,
  transformerName: string = TRANSFORMER_NAME,
): ASTDecoratorDetector => (name: string, path: string): boolean =>
  name === decoratorName && minimatch(path, transformerName);

const transformer: ASTDecoratorTransformer = (
  _,
  {transformerPath}: TransformAccessorOptions = {},
) => [
  [accessorTransformer, detector('accessor', transformerPath)] as const,
  [getterTransformer, detector('getter', transformerPath)] as const,
  [setterTransformer, detector('setter', transformerPath)] as const,
];

export default transformer;
