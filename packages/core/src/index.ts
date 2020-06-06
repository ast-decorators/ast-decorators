/* eslint-disable global-require */
import ASTDecoratorsError from '@ast-decorators/utils/lib/ASTDecoratorsError';
import checkNodeModule from '@ast-decorators/utils/lib/checkNodeModule';
import type {
  ASTDecoratorCoreOptions,
  ASTDecoratorTransformer,
  ClassMember,
  PluginPass,
} from '@ast-decorators/utils/lib/common';
import type {NodePath} from '@babel/traverse';
import {Class, isClassDeclaration, isClassExpression} from '@babel/types';
import {resolve} from 'path';
import processDecorators from './processor';
import type {EntitiesExtractor, Mutable, TransformerMap} from './utils';

type UncheckedPluginPass<T = object> = Omit<PluginPass<T>, 'filename'> &
  Readonly<{
    filename?: string;
  }>;

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

const extractClass: EntitiesExtractor = (klass: NodePath<Class>) => [klass];
const extractClassMember: EntitiesExtractor = (
  member: NodePath<ClassMember>,
) => {
  const klass = member.findParent(
    path => isClassDeclaration(path) || isClassExpression(path),
  ) as NodePath<Class>;

  return [klass, member];
};

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
        klass: NodePath<Class>,
        opts: UncheckedPluginPass,
      ) {
        processDecorators(
          klass,
          extractClass,
          transformerMap,
          opts as PluginPass,
        );
      },
      'ClassProperty|ClassMethod|ClassPrivateProperty|ClassPrivateMethod'(
        member: NodePath<ClassMember>,
        opts: UncheckedPluginPass,
      ) {
        processDecorators(
          member,
          extractClassMember,
          transformerMap,
          opts as PluginPass,
        );
      },
    },
  };
};

export default babelPluginAstDecoratorsCore;
