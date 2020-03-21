/* eslint-disable global-require */
import {
  ASTDecoratorCoreOptions,
  ASTDecoratorTransformer,
  DecorableClass,
  DecorableClassMember,
  PluginPass,
} from '@ast-decorators/typings';
import {NodePath} from '@babel/core';
import {Decorator} from '@babel/types';
import processClassDecorator from './class';
import processClassMemberDecorator from './property';
import {
  ASTDecoratorsError,
  Mutable,
  TransformerMap,
  TransformerMapItem,
} from './utils';

type UncheckedPluginPass<T = object> = Omit<PluginPass<T>, 'filename'> &
  Readonly<{
    filename?: string;
  }>;

const processEachDecorator = (
  path: NodePath<DecorableClass | DecorableClassMember>,
  opts: UncheckedPluginPass,
  transformerMap: TransformerMap,
  processor: (
    decorator: NodePath<Decorator>,
    transformerMap: TransformerMap,
    options: PluginPass,
  ) => void,
): void => {
  if (!opts.filename) {
    throw new ASTDecoratorsError(
      'AST Decorators system requires filename to be set',
    );
  }

  if (path.node.decorators?.length > 0) {
    const decorators = path.get('decorators') as ReadonlyArray<
      NodePath<Decorator>
    >;

    // Decorators apply in the reverse order of their storing
    for (let i = decorators.length - 1; i >= 0; i--) {
      processor(decorators[i], transformerMap, opts as PluginPass);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!path.node) {
        break;
      }
    }
  }
};

const prepareTransformerMap = (
  transformers: Required<ASTDecoratorCoreOptions>['transformers'],
): TransformerMap =>
  transformers.reduce<Mutable<TransformerMap>>((acc, item) => {
    if (!Array.isArray(item)) {
      const imported: Record<string, ASTDecoratorTransformer> =
        typeof item === 'string' ? require(item) : item;

      acc.push(...Object.values(imported));
    } else {
      const [transformer, options] = item;
      const imported: Record<string, ASTDecoratorTransformer> =
        typeof transformer === 'string' ? require(transformer) : transformer;

      acc.push(
        ...Object.values(imported).map<TransformerMapItem>(
          ([detector, decorator]) => [detector, decorator, options],
        ),
      );
    }

    return acc;
  }, []);

const babelPluginAstDecoratorsCore = (
  _: object,
  {transformers}: ASTDecoratorCoreOptions,
): object => {
  if (!transformers) {
    throw new ASTDecoratorsError('No transformers provided');
  }

  const transformerMap = prepareTransformerMap(transformers);

  return {
    visitor: {
      'ClassDeclaration|ClassExpression'(
        path: NodePath<DecorableClass>,
        opts: UncheckedPluginPass,
      ) {
        processEachDecorator(path, opts, transformerMap, processClassDecorator);
      },
      'ClassProperty|ClassMethod|ClassPrivateProperty|ClassPrivateMethod'(
        path: NodePath<DecorableClassMember>,
        opts: UncheckedPluginPass,
      ) {
        processEachDecorator(
          path,
          opts,
          transformerMap,
          processClassMemberDecorator,
        );
      },
    },
  };
};

export default babelPluginAstDecoratorsCore;
