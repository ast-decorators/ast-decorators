import {
  ASTDecoratorDetector,
  ASTDecoratorTransformer,
} from '@ast-decorators/typings';
import minimatch from 'minimatch';
import accessor from './accessor';
import getter from './getter';
import setter from './setter';
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
  [accessor, detector('accessor', transformerPath)] as const,
  [getter, detector('getter', transformerPath)] as const,
  [setter, detector('setter', transformerPath)] as const,
];

export default transformer;
