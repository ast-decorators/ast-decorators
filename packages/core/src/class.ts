import type {PluginPass} from '@ast-decorators/utils/lib/common';
import type {NodePath} from '@babel/traverse';
import type {Class, Decorator} from '@babel/types';
import processDecorator from './processor';
import type {TransformerMap} from './utils';

const processClassDecorator = (
  decorator: NodePath<Decorator>,
  transformerMap: TransformerMap,
  options: PluginPass,
): void => {
  const klass = decorator.parentPath as NodePath<Class>;

  processDecorator(decorator, [klass], transformerMap, options);
};

export default processClassDecorator;
