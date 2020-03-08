import {
  DecorableClass,
  DecorableClassMember,
} from '@ast-decorators/utils/lib/commonTypes';
import {ASTDecoratorPluginOptions} from '@ast-decorators/utils/src/commonTypes';
import {NodePath} from '@babel/core';
import {Decorator} from '@babel/types';
import processClassDecorator from './class';
import processClassMemberDecorator from './property';
import {PluginPass} from './utils';

const processEachDecorator = (
  path: NodePath<DecorableClass | DecorableClassMember>,
  opts: PluginPass<ASTDecoratorPluginOptions>,
  processor: (
    decorator: NodePath<Decorator>,
    options: PluginPass<ASTDecoratorPluginOptions>,
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
      opts: PluginPass<ASTDecoratorPluginOptions>,
    ) {
      processEachDecorator(path, opts, processClassDecorator);
    },
    'ClassProperty|ClassMethod|ClassPrivateProperty|ClassPrivateMethod'(
      path: NodePath<DecorableClassMember>,
      opts: PluginPass<ASTDecoratorPluginOptions>,
    ) {
      processEachDecorator(path, opts, processClassMemberDecorator);
    },
  },
});

export default babelPluginAstDecorators;
