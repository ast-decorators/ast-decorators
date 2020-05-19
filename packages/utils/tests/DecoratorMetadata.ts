/* eslint-disable callback-return */
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
  StringLiteral,
} from '@babel/types';
import {parseToAST as _parseToAST} from '../../../utils/testing';
import {DecoratorMetadata, ImportMetadata} from '../src/metadata';
import options from './fixtures/DecoratorMetadata/options';

const parseToAST = async (fixture: string): ReturnType<typeof _parseToAST> =>
  _parseToAST(__dirname, 'DecoratorMetadata', fixture, options);

describe('@ast-decorators/utils', () => {
  describe('ImportMetadata', () => {
    const run = async (
      fixture: string,
      callback: (callee: NodePath<Identifier>) => void,
    ): Promise<void> => {
      const ast = await parseToAST(fixture);

      await new Promise(resolve => {
        traverse(ast!, {
          CallExpression(path: NodePath<CallExpression>) {
            const callee = path.get('callee') as NodePath<Identifier>;

            callback(callee);

            resolve();
          },
        });
      });
    };

    it('provides metadata for imported element', async () => {
      await run('default', callee => {
        const metadata = new ImportMetadata(callee);

        expect(metadata.binding).toBe(
          callee.parentPath.scope.getBinding('bar'),
        );
        expect(metadata.importSpecifier?.get('local').node.name).toBe('bar');
        expect(metadata.importSource?.node.value).toBe('fns');

        expect(isIdentifier(metadata.identifier)).toBeTruthy();
        expect(isIdentifier(metadata.importIdentifier)).toBeTruthy();
        expect(metadata.importIdentifier.node.name).toEqual('bar');
        expect(metadata.identifier.node.name).toEqual('bar');
        expect(metadata.importIdentifier).toBe(metadata.identifier);

        expect(metadata.isMember).not.toBeTruthy();
      });
    });

    it('provides metadata for element that is a part of member expression', async () => {
      await run('member', callee => {
        const metadata = new ImportMetadata(callee);

        expect(metadata.binding).toBe(
          callee.parentPath.scope.getBinding('fns'),
        );
        expect(metadata.importSpecifier?.get('local').node.name).toBe('fns');
        expect(metadata.importSource?.node.value).toBe('fns');

        expect(metadata.isMember).toBeTruthy();
        expect(isIdentifier(metadata.importIdentifier)).toBeTruthy();
        expect(metadata.importIdentifier.node.name).toEqual('fns');

        expect(isIdentifier(metadata.identifier)).toBeTruthy();
        expect(metadata.identifier.node.name).toEqual('bar');
      });
    });

    it('removes binding for an element', async () => {
      await run('default', callee => {
        const metadata = new ImportMetadata(callee);

        const importDeclaration = metadata.importSpecifier!
          .parentPath as NodePath<ImportDeclaration>;

        expect(isImportDeclaration(importDeclaration.node)).toBeTruthy();

        metadata.removeBinding();
        expect(importDeclaration.node).toBeNull();
      });
    });

    it('leaves untouched other bindings when removes an element binding', async () => {
      await run('multiple-import', callee => {
        if (callee.node.name === 'foo') {
          return;
        }

        const metadata = new ImportMetadata(callee);

        const importDeclaration = metadata.importSpecifier!
          .parentPath as NodePath<ImportDeclaration>;

        metadata.removeBinding();

        const specifiers = importDeclaration.get('specifiers') as ReadonlyArray<
          NodePath<ImportSpecifier>
        >;
        expect(specifiers.length).toBe(1);

        const [specifier] = specifiers;
        expect(specifier.get('local').node.name).toBe('foo');
      });
    });

    describe('originalImportName', () => {
      it('gets "default" as an original name if import is default', async () => {
        await run('import-default', callee => {
          const metadata = new ImportMetadata(callee);

          expect(metadata.originalImportName).toBe('default');
        });
      });

      it("gets an element's name if import is namespace", async () => {
        await run('import-namespace', callee => {
          const metadata = new ImportMetadata(callee);

          expect(metadata.originalImportName).toBe('foo');
        });
      });

      it('gets an imported name as an original name if import element is re-named', async () => {
        await run('import-named', callee => {
          const metadata = new ImportMetadata(callee);

          expect(metadata.originalImportName).toBe('foo');
        });
      });
    });
  });

  describe('DecoratorMetadata', () => {
    const run = async (
      fixture: string,
      callback: (decorator: NodePath<Decorator>) => void,
    ): Promise<void> => {
      const ast = await parseToAST(fixture);

      return new Promise(resolve => {
        traverse(ast!, {
          Decorator(path: NodePath<Decorator>) {
            callback(path);
            resolve();
          },
        });
      });
    };

    it('provides metadata for decorator without args', async () => {
      await run('without-args', decorator => {
        const metadata = new DecoratorMetadata(decorator);

        expect(metadata.args).toEqual([]);
        expect(metadata.isCall).not.toBeTruthy();
      });
    });

    it('provides metadata for decorator with args', async () => {
      await run('with-args', decorator => {
        const metadata = new DecoratorMetadata(decorator);

        expect(metadata.args.length).toBe(1);

        const [arg] = metadata.args as ReadonlyArray<NodePath<StringLiteral>>;

        expect(isStringLiteral(arg)).toBeTruthy();
        expect(arg.node.value).toEqual('fuzz');

        expect(metadata.isCall).toBeTruthy();
      });
    });

    it('removes decorator', async () => {
      await run('without-args', decorator => {
        const metadata = new DecoratorMetadata(decorator);

        metadata.remove();
        expect(decorator.node).toBeNull();
      });
    });
  });
});
