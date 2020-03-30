import {PluginPass} from '@ast-decorators/utils/lib/common';
import {NodePath} from '@babel/core';
import {Class, Decorator} from '@babel/types';
import processDecorator from './processor';
import {TransformerMap} from './utils';

const processClassDecorator = (
  decorator: NodePath<Decorator>,
  transformerMap: TransformerMap,
  options: PluginPass,
): void => {
  const klass = decorator.parentPath as NodePath<Class>;

  processDecorator(decorator, [klass], transformerMap, options);
};

export default processClassDecorator;
