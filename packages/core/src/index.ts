import {
  ASTDecoratorTransformerOptions,
  DecorableClass,
  DecorableClassMember,
  PluginPass,
} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {Decorator} from '@babel/types';
import processClassDecorator from './class';
import processClassMemberDecorator from './property';

const processEachDecorator = (
  path: NodePath<DecorableClass | DecorableClassMember>,
  opts: PluginPass<ASTDecoratorTransformerOptions>,
  processor: (
    decorator: NodePath<Decorator>,
    options: PluginPass<ASTDecoratorTransformerOptions>,
  ) => void,
): void => {
  if (path.node.decorators?.length > 0) {
    const decorators = path.get('decorators') as ReadonlyArray<
      NodePath<Decorator>
    >;

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
      opts: PluginPass<ASTDecoratorTransformerOptions>,
    ) {
      processEachDecorator(path, opts, processClassDecorator);
    },
    'ClassProperty|ClassMethod|ClassPrivateProperty|ClassPrivateMethod'(
      path: NodePath<DecorableClassMember>,
      opts: PluginPass<ASTDecoratorTransformerOptions>,
    ) {
      processEachDecorator(path, opts, processClassMemberDecorator);
    },
  },
});

export default babelPluginAstDecorators;
