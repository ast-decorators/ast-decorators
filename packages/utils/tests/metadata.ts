import traverse, {NodePath} from '@babel/traverse';
import {
  CallExpression,
  Decorator,
  Identifier,
  ImportDeclaration,
  ImportSpecifier,
  isIdentifier,
  isImportDeclaration,
  isStringLiteral,
  MemberExpression,
  StringLiteral,
} from '@babel/types';
import {parse as _parse} from '../../../utils/testing';
import {DecoratorMetadata, ImportMetadata} from '../src/metadata';
import options from './fixtures/DecoratorMetadata/options';

const parse = async (fixture: string): ReturnType<typeof _parse> =>
  _parse(__dirname, 'DecoratorMetadata', fixture, options);

describe('@ast-decorators/utils', () => {
  describe('ImportMetadata', () => {
    it('provides metadata for imported element', async () => {
      const ast = await parse('default');

      await new Promise(resolve => {
        traverse(ast!, {
          CallExpression(path: NodePath<CallExpression>) {
            const callee = path.get('callee') as NodePath<Identifier>;

            const metadata = new ImportMetadata(callee);

            expect(metadata.binding).toBe(path.scope.getBinding('bar'));
            expect(metadata.importSpecifier?.get('local').node.name).toBe(
              'bar',
            );
            expect(metadata.importSource?.node.value).toBe('fns');

            expect(isIdentifier(metadata.identifier)).toBeTruthy();
            expect(isIdentifier(metadata.importIdentifier)).toBeTruthy();
            expect(metadata.importIdentifier.node.name).toEqual('bar');
            expect(metadata.identifier.node.name).toEqual('bar');
            expect(metadata.importIdentifier).toBe(metadata.identifier);

            expect(metadata.isMember).not.toBeTruthy();

            resolve();
          },
        });
      });
    });

    it('provides metadata for element that is a part of member expression', async () => {
      const ast = await parse('member');

      await new Promise(resolve => {
        traverse(ast!, {
          CallExpression(path: NodePath<CallExpression>) {
            const callee = path.get('callee') as NodePath<MemberExpression>;

            const metadata = new ImportMetadata(callee);

            expect(metadata.binding).toBe(path.scope.getBinding('fns'));
            expect(metadata.importSpecifier?.get('local').node.name).toBe(
              'fns',
            );
            expect(metadata.importSource?.node.value).toBe('fns');

            expect(metadata.isMember).toBeTruthy();
            expect(isIdentifier(metadata.importIdentifier)).toBeTruthy();
            expect(metadata.importIdentifier.node.name).toEqual('fns');

            expect(isIdentifier(metadata.identifier)).toBeTruthy();
            expect(metadata.identifier.node.name).toEqual('bar');

            resolve();
          },
        });
      });
    });

    it('removes binding for an element', async () => {
      const ast = await parse('default');

      return new Promise(resolve => {
        traverse(ast!, {
          CallExpression(path: NodePath<CallExpression>) {
            const callee = path.get('callee') as NodePath<Identifier>;
            const metadata = new ImportMetadata(callee);

            const importDeclaration = metadata.importSpecifier!
              .parentPath as NodePath<ImportDeclaration>;

            expect(isImportDeclaration(importDeclaration.node)).toBeTruthy();

            metadata.removeBinding();
            expect(importDeclaration.node).toBeNull();

            resolve();
          },
        });
      });
    });

    it('leaves untouched other bindings when removes an element binding', async () => {
      const ast = await parse('multiple-import');

      return new Promise(resolve => {
        traverse(ast!, {
          CallExpression(path: NodePath<CallExpression>) {
            const callee = path.get('callee') as NodePath<Identifier>;

            if (callee.node.name === 'foo') {
              return;
            }

            const metadata = new ImportMetadata(callee);

            const importDeclaration = metadata.importSpecifier!
              .parentPath as NodePath<ImportDeclaration>;

            metadata.removeBinding();

            const specifiers = importDeclaration.get(
              'specifiers',
            ) as ReadonlyArray<NodePath<ImportSpecifier>>;
            expect(specifiers.length).toBe(1);

            const [specifier] = specifiers;
            expect(specifier.get('local').node.name).toBe('foo');

            resolve();
          },
        });
      });
    });

    describe('originalImportName', () => {
      it('gets "default" as an original name if import is default', async () => {
        const ast = await parse('import-default');

        return new Promise(resolve => {
          traverse(ast!, {
            CallExpression(path: NodePath<CallExpression>) {
              const callee = path.get('callee') as NodePath<Identifier>;
              const metadata = new ImportMetadata(callee);

              expect(metadata.originalImportName).toBe('default');

              resolve();
            },
          });
        });
      });

      it("gets an element's name if import is namespace", async () => {
        const ast = await parse('import-namespace');

        return new Promise(resolve => {
          traverse(ast!, {
            CallExpression(path: NodePath<CallExpression>) {
              const callee = path.get('callee') as NodePath<MemberExpression>;
              const metadata = new ImportMetadata(callee);

              expect(metadata.originalImportName).toBe('foo');

              resolve();
            },
          });
        });
      });

      it('gets an imported name as an original name if import element is re-named', async () => {
        const ast = await parse('import-named');

        return new Promise(resolve => {
          traverse(ast!, {
            CallExpression(path: NodePath<CallExpression>) {
              const callee = path.get('callee') as NodePath<Identifier>;
              const metadata = new ImportMetadata(callee);

              expect(metadata.originalImportName).toBe('foo');

              resolve();
            },
          });
        });
      });
    });
  });

  describe('DecoratorMetadata', () => {
    it('provides metadata for decorator without args', async () => {
      const ast = await parse('without-args');

      return new Promise(resolve => {
        traverse(ast!, {
          Decorator(path: NodePath<Decorator>) {
            const metadata = new DecoratorMetadata(path);

            expect(metadata.args).toEqual([]);
            expect(metadata.isCall).not.toBeTruthy();
            resolve();
          },
        });
      });
    });

    it('provides metadata for decorator with args', async () => {
      const ast = await parse('with-args');

      return new Promise(resolve => {
        traverse(ast!, {
          Decorator(path: NodePath<Decorator>) {
            const metadata = new DecoratorMetadata(path);

            expect(metadata.args.length).toBe(1);

            const [arg] = metadata.args as ReadonlyArray<
              NodePath<StringLiteral>
            >;

            expect(isStringLiteral(arg)).toBeTruthy();
            expect(arg.node.value).toEqual('fuzz');

            expect(metadata.isCall).toBeTruthy();
            resolve();
          },
        });
      });
    });

    it('removes decorator', async () => {
      const ast = await parse('without-args');

      return new Promise(resolve => {
        traverse(ast!, {
          Decorator(path: NodePath<Decorator>) {
            const metadata = new DecoratorMetadata(path);

            metadata.remove();
            expect(path.node).toBeNull();

            resolve();
          },
        });
      });
    });
  });
});
