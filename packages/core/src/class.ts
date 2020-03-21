import {DecorableClass, PluginPass} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {Decorator} from '@babel/types';
import processDecorator from './processor';
import {TransformerMap} from './utils';

const processClassDecorator = (
  decorator: NodePath<Decorator>,
  transformerMap: TransformerMap,
  options: PluginPass,
): void => {
  const klass = decorator.parentPath as NodePath<DecorableClass>;

  processDecorator(decorator, [klass], transformerMap, options);
};

export default processClassDecorator;
