import {
  ASTDecoratorCoreOptions,
  ASTDecoratorTransformerOptions,
  DecorableClass,
  DecorableClassMember,
  PluginPass,
} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {Decorator} from '@babel/types';
import processClassDecorator from './class';
import processClassMemberDecorator from './property';

type UncheckedPluginPass<T> = Omit<PluginPass<T>, 'filename'> &
  Readonly<{
    filename?: string;
  }>;

const processEachDecorator = (
  path: NodePath<DecorableClass | DecorableClassMember>,
  opts: UncheckedPluginPass<
    ASTDecoratorCoreOptions<ASTDecoratorTransformerOptions>
  >,
  processor: (
    decorator: NodePath<Decorator>,
    options: PluginPass<
      ASTDecoratorCoreOptions<ASTDecoratorTransformerOptions>
    >,
  ) => void,
): void => {
  if (!opts.filename) {
    throw new Error(
      '[AST Decorators]: AST Decorators system requires filename to be set',
    );
  }

  if (path.node.decorators?.length > 0) {
    const decorators = path.get('decorators') as ReadonlyArray<
      NodePath<Decorator>
    >;

    // Decorators apply in the reverse order of their storing
    for (let i = decorators.length - 1; i >= 0; i--) {
      processor(
        decorators[i],
        opts as PluginPass<
          ASTDecoratorCoreOptions<ASTDecoratorTransformerOptions>
        >,
      );

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
      opts: UncheckedPluginPass<
        ASTDecoratorCoreOptions<ASTDecoratorTransformerOptions>
      >,
    ) {
      processEachDecorator(path, opts, processClassDecorator);
    },
    'ClassProperty|ClassMethod|ClassPrivateProperty|ClassPrivateMethod'(
      path: NodePath<DecorableClassMember>,
      opts: UncheckedPluginPass<
        ASTDecoratorCoreOptions<ASTDecoratorTransformerOptions>
      >,
    ) {
      processEachDecorator(path, opts, processClassMemberDecorator);
    },
  },
});

export default babelPluginAstDecorators;
