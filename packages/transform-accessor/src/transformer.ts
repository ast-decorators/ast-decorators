import type {
  ASTDecoratorDetector,
  ASTDecoratorTransformer,
} from '@ast-decorators/utils/lib/common';
import type {NodePath} from '@babel/traverse';
import minimatch from 'minimatch';
import {accessorTransformer} from './accessor';
import {getterTransformer} from './getter';
import {setterTransformer} from './setter';
import {trackedTransformer} from './tracked';
import {
  AccessorInterceptorNode,
  TransformAccessorOptions,
  TRANSFORMER_NAME,
} from './utils';

const detector = (
  decoratorName: string,
  transformerName: string = TRANSFORMER_NAME,
): ASTDecoratorDetector => (name: string, path: string): boolean =>
  name === decoratorName && minimatch(path, transformerName);

const transformer: ASTDecoratorTransformer<
  | [NodePath<AccessorInterceptorNode>?, NodePath<AccessorInterceptorNode>?]
  | [NodePath<AccessorInterceptorNode>?],
  TransformAccessorOptions
> = (_, {transformerPath}: TransformAccessorOptions = {}) => [
  [accessorTransformer, detector('accessor', transformerPath)] as const,
  [getterTransformer, detector('getter', transformerPath)] as const,
  [setterTransformer, detector('setter', transformerPath)] as const,
  [trackedTransformer, detector('tracked', transformerPath)] as const,
];

export default transformer;
