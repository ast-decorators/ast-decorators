import traverse, {NodePath} from '@babel/traverse';
import {
  Decorator,
  ImportDeclaration,
  ImportSpecifier,
  isIdentifier,
  isImportDeclaration,
  isStringLiteral,
  StringLiteral,
} from '@babel/types';
import {parse as _parse} from '../../../utils/testing';
import DecoratorMetadata from '../src/DecoratorMetadata';
import options from './fixtures/DecoratorMetadata/options';

const parse = async (fixture: string): ReturnType<typeof _parse> =>
  _parse(__dirname, 'DecoratorMetadata', fixture, options);

describe('@ast-decorators/utils', () => {
  describe('DecoratorMetadata', () => {
    it('provides metadata for decorator without args', async done => {
      const ast = await parse('without-args');

      traverse(ast!, {
        Decorator(path: NodePath<Decorator>) {
          const metadata = new DecoratorMetadata(path);

          expect(metadata.args).toEqual([]);
          expect(metadata.importSpecifier!.get('local').node.name).toBe('bar');
          expect(metadata.importSource!.node.value).toBe('decorators');
          expect(metadata.binding).toBe(path.scope.getBinding('bar'));
          expect(isIdentifier(metadata.bindingId)).toBeTruthy();
          expect(metadata.bindingId.node.name).toEqual('bar');
          expect(metadata.isCall).not.toBeTruthy();
          expect(metadata.isFree).toBeTruthy();
          expect(metadata.property).toBeUndefined();
          done();
        },
      });
    });

    it('provides metadata for decorator with args', async done => {
      const ast = await parse('with-args');

      traverse(ast!, {
        Decorator(path: NodePath<Decorator>) {
          const metadata = new DecoratorMetadata(path);

          expect(metadata.args.length).toBe(1);

          const [arg] = metadata.args as ReadonlyArray<NodePath<StringLiteral>>;

          expect(isStringLiteral(arg)).toBeTruthy();
          expect(arg.node.value).toEqual('fuzz');
          expect(metadata.isCall).toBeTruthy();
          done();
        },
      });
    });

    it('provides metadata for decorator that is a part of member expression', async done => {
      const ast = await parse('member');

      traverse(ast!, {
        Decorator(path: NodePath<Decorator>) {
          const metadata = new DecoratorMetadata(path);

          expect(metadata.bindingId.node.name).toEqual('decorators');
          expect(isIdentifier(metadata.property)).toBeTruthy();
          expect(metadata.property!.node.name).toBe('bar');
          expect(metadata.isFree).not.toBeTruthy();
          done();
        },
      });
    });

    it('removes decorator', async done => {
      const ast = await parse('member');

      traverse(ast!, {
        Decorator(path: NodePath<Decorator>) {
          const metadata = new DecoratorMetadata(path);

          metadata.removeDecorator();
          expect(path.node).toBeNull();

          done();
        },
      });
    });

    it('removes binding for decorator', async done => {
      const ast = await parse('member');

      traverse(ast!, {
        Decorator(path: NodePath<Decorator>) {
          const metadata = new DecoratorMetadata(path);

          const importDeclaration = metadata.importSpecifier!
            .parentPath as NodePath<ImportDeclaration>;

          expect(isImportDeclaration(importDeclaration.node)).toBeTruthy();

          metadata.removeBinding();
          expect(importDeclaration.node).toBeNull();

          done();
        },
      });
    });

    it('leaves untouched other bindings when removes decorator binding', async done => {
      const ast = await parse('multiple-import');

      traverse(ast!, {
        Decorator(path: NodePath<Decorator>) {
          const metadata = new DecoratorMetadata(path);

          const importDeclaration = metadata.importSpecifier!
            .parentPath as NodePath<ImportDeclaration>;

          metadata.removeBinding();

          const specifiers = importDeclaration.get(
            'specifiers',
          ) as ReadonlyArray<NodePath<ImportSpecifier>>;
          expect(specifiers.length).toBe(1);

          const [specifier] = specifiers;
          expect(specifier.get('local').node.name).toBe('Fuzz');

          done();
        },
      });
    });
  });
});
