import type {
  ASTDecoratorDetector,
  ASTDecoratorTransformer,
  ClassMemberProperty,
} from '@ast-decorators/utils/lib/common';
import type {NodePath} from '@babel/traverse';
import minimatch from 'minimatch';
import {accessorTransformer} from './accessor';
import {getterTransformer} from './getter';
import {setterTransformer} from './setter';
import type {AccessorInterceptorNode, TransformAccessorOptions} from './utils';

export const TRANSFORMER_NAME = '@ast-decorators/transform-accessor';

const detector = (
  decoratorName: string,
  transformerName: string = TRANSFORMER_NAME,
): ASTDecoratorDetector => (name: string, path: string): boolean =>
  name === decoratorName && minimatch(path, transformerName);

const transformer: ASTDecoratorTransformer<
  | [NodePath<AccessorInterceptorNode>?, NodePath<AccessorInterceptorNode>?]
  | [NodePath<AccessorInterceptorNode>?],
  TransformAccessorOptions,
  ClassMemberProperty
> = (_, {transformerPath}: TransformAccessorOptions = {}) => [
  [accessorTransformer, detector('accessor', transformerPath)] as const,
  [getterTransformer, detector('getter', transformerPath)] as const,
  [setterTransformer, detector('setter', transformerPath)] as const,
];

export default transformer;
