import {NodePath} from '@babel/core';
import {Decorator} from '@babel/types';
import processClassDecorator from './class';
import {DecoratorProcessorOptions} from './processor';
import processClassPropertyOrMethodDecorator from './property';
import {DecorableClass, DecorableClassMember} from './utils';

const processEachDecorator = (
  path: NodePath<DecorableClass | DecorableClassMember>,
  opts: DecoratorProcessorOptions,
  processor: (
    decorator: NodePath<Decorator>,
    options: DecoratorProcessorOptions,
  ) => void,
): void => {
  if (path.node.decorators?.length > 0) {
    const decorators = path.get('decorators') as Array<NodePath<Decorator>>;

    let decorator: NodePath<Decorator> | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (path.node && (decorator = decorators.pop())) {
      processor(decorator, opts);
    }
  }
};

const babelPluginAstDecorators = (): object => ({
  visitor: {
    'ClassDeclaration|ClassExpression'(
      path: NodePath<DecorableClass>,
      opts: DecoratorProcessorOptions,
    ) {
      processEachDecorator(path, opts, processClassDecorator);
    },
    'ClassProperty|ClassMethod|ClassPrivateProperty|ClassPrivateMethod'(
      path: NodePath<DecorableClassMember>,
      opts: DecoratorProcessorOptions,
    ) {
      processEachDecorator(path, opts, processClassPropertyOrMethodDecorator);
    },
  },
});

export default babelPluginAstDecorators;
