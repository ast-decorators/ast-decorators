import {NodePath, traverse} from '@babel/core';
import generate from '@babel/generator';
import {BlockStatement, FunctionDeclaration} from '@babel/types';
import {parseToAST as _parseToAST} from '../../../utils/testing';
import {
  createThisBinding,
  findOrCreateThisBinding,
  findThisBinding,
  findThisBindingIndex,
} from '../src/thisBindingUtils';
import options from './fixtures/thisBindingUtils/options';

const parseToAST = async (fixture: string): ReturnType<typeof _parseToAST> =>
  _parseToAST(__dirname, 'thisBindingUtils', fixture, options);

const run = async (
  fixture: string,
  callback: (member: NodePath<BlockStatement>) => void,
): Promise<void> => {
  const ast = await parseToAST(fixture);

  await new Promise(resolve => {
    traverse(ast!, {
      FunctionDeclaration(path: NodePath<FunctionDeclaration>) {
        // eslint-disable-next-line callback-return
        callback(path.get('body'));
        resolve();
      },
    });
  });
};

describe('@ast-decorators/utils', () => {
  describe('findThisBindingIndex', () => {
    it('finds "this" binding statement index in the body', async () => {
      await run('with-binding', body => {
        expect(findThisBindingIndex(body.node)).toBe(1);
      });
    });

    it('returns null if no statement found', async () => {
      await run('without-binding', body => {
        expect(findThisBindingIndex(body.node)).toBeNull();
      });
    });
  });

  describe('findThisBinding', () => {
    it('finds "this" binding statement', async () => {
      await run('with-binding', body => {
        const idOrNull = findThisBinding(body.node);

        expect(idOrNull).not.toBeNull();
        expect(idOrNull!.name).toBe('_this');
      });
    });

    it('returns null if no statement found', async () => {
      await run('without-binding', body => {
        expect(findThisBinding(body.node)).toBeNull();
      });
    });
  });

  describe('createThisBinding', () => {
    it('creates "this" binding statement if there is an existing function', async () => {
      await run('with-binding', body => {
        const [id, declaration] = createThisBinding(body.scope);

        expect(id.name).toBe('_this2');
        expect(generate(declaration).code).toBe('const _this2 = this;');
      });
    });

    it('creates "this" binding statement if there is no function', () => {
      const [id, declaration] = createThisBinding();

      expect(id.name).toBe('_this');
      expect(generate(declaration).code).toBe('const _this = this;');
    });
  });

  describe('findOrCreateThisBinding', () => {
    it('finds the binding if it exists', async () => {
      await run('with-binding', body => {
        const [id, declaration] = findOrCreateThisBinding(body);

        expect(id.name).toBe('_this');
        expect(declaration).toBeUndefined();
      });
    });

    it('finds the binding if it exists', async () => {
      await run('without-binding', body => {
        const [id, declaration] = findOrCreateThisBinding(body);

        expect(id.name).toBe('_this');
        expect(declaration).not.toBeUndefined();
        expect(generate(declaration!).code).toBe('const _this = this;');
      });
    });
  });
});
