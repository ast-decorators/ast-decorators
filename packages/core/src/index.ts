/* eslint-disable global-require */
import {
  ASTDecoratorCoreOptions,
  ASTDecoratorTransformer,
  DecorableClass,
  DecorableClassMember,
  PluginPass,
} from '@ast-decorators/typings';
import checkNodeModule from '@ast-decorators/utils/lib/checkNodeModule';
import {NodePath} from '@babel/core';
import {Decorator} from '@babel/types';
import processClassDecorator from './class';
import processClassMemberDecorator from './property';
import {ASTDecoratorsError, Mutable, TransformerMap} from './utils';
import {resolve} from 'path';

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

type TransformerModule = {
  default: ASTDecoratorTransformer;
};

/* istanbul ignore next */
const interop = (obj: any): TransformerModule =>
  obj && obj.__esModule ? obj : {default: obj};

const cwd = process.cwd();

const calculateImport = (path: string): string =>
  checkNodeModule(path) ? path : resolve(cwd, path);

const prepareTransformerMap = (
  transformers: Required<ASTDecoratorCoreOptions>['transformers'],
  babel: object,
): TransformerMap =>
  transformers.reduce<Mutable<TransformerMap>>((acc, item) => {
    if (!Array.isArray(item)) {
      const {default: transformer}: TransformerModule = interop(
        typeof item === 'string' ? require(calculateImport(item)) : item,
      );

      acc.push(...transformer(babel));
    } else {
      const [pathOrTransformer, options] = item;
      const {default: transformer}: TransformerModule = interop(
        typeof pathOrTransformer === 'string'
          ? require(calculateImport(pathOrTransformer))
          : pathOrTransformer,
      );

      acc.push(
        ...transformer(babel, options).map(
          ([detector, decorator]) => [detector, decorator, options] as const,
        ),
      );
    }

    return acc;
  }, []);

const babelPluginAstDecoratorsCore = (
  babel: object,
  {transformers}: ASTDecoratorCoreOptions,
): object => {
  if (!transformers) {
    throw new ASTDecoratorsError('No transformers provided');
  }

  const transformerMap = prepareTransformerMap(transformers, babel);

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
