import {NodePath} from '@babel/core';
import {Decorator} from '@babel/types';
import processClassDecorator from './class';
import {DecoratorProcessorOptions} from './processor';
import processClassMemberDecorator from './property';
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

    // Decorators apply in the reverse order of their storing
    for (let i = decorators.length - 1; i >= 0; i--) {
      processor(decorators[i], opts);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!path.node) {
        break;
      }
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
      processEachDecorator(path, opts, processClassMemberDecorator);
    },
  },
});

export default babelPluginAstDecorators;
