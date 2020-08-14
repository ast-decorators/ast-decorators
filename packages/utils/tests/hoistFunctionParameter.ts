import {NodePath, traverse} from '@babel/core';
import generate from '@babel/generator';
import {
  CallExpression,
  Class,
  Decorator,
  Identifier,
  isClass,
  isIdentifier,
  isMemberExpression,
} from '@babel/types';
import {parseToAST as _parseToAST} from '../../../utils/testing';
import hoistFunctionParameter, {
  FunctionParameter,
} from '../src/hoistFunctionParameter';
import options from './fixtures/getMemberName/options';

const parseToAST = async (fixture: string): ReturnType<typeof _parseToAST> =>
  _parseToAST(__dirname, 'hoistFunctionParameter', fixture, options);

const run = async (
  fixture: string,
  callback: (fn: FunctionParameter, classPath: NodePath<Class>) => void,
): Promise<void> => {
  const ast = await parseToAST(fixture);

  await new Promise((resolve) => {
    traverse(ast!, {
      Decorator(path: NodePath<Decorator>) {
        const [fn] = (path.node.expression as CallExpression).arguments;

        // eslint-disable-next-line callback-return
        callback(
          fn as FunctionParameter,
          path.findParent(({node}) => isClass(node)) as NodePath<Class>,
        );
        resolve();
      },
    });
  });
};

describe('@ast-decorators/utils', () => {
  describe('hoistFunctionParameter', () => {
    it('hoists the arrow function parameter', async () => {
      await run('parameter-arrow', (fn, classPath) => {
        const [id, declaration] = hoistFunctionParameter(
          fn,
          'param',
          classPath.parentPath.scope,
        );

        expect(isIdentifier(id)).toBeTruthy();
        expect((id as Identifier).name).toBe('_param');
        expect(declaration).not.toBeUndefined();
        expect(generate(declaration!).code).toMatchSnapshot();
      });
    });

    it('hoists the regular function parameter', async () => {
      await run('parameter-regular', (fn, classPath) => {
        const [id, declaration] = hoistFunctionParameter(
          fn,
          'param',
          classPath.parentPath.scope,
        );

        expect(isIdentifier(id)).toBeTruthy();
        expect((id as Identifier).name).toBe('_param');
        expect(declaration).not.toBeUndefined();
        expect(generate(declaration!).code).toMatchSnapshot();
      });
    });

    it('gets the identifier parameter id', async () => {
      await run('parameter-identifier', (fn, classPath) => {
        const [id, declaration] = hoistFunctionParameter(
          fn,
          'param',
          classPath.parentPath.scope,
        );

        expect(isIdentifier(id)).toBeTruthy();
        expect((id as Identifier).name).toBe('fn');
        expect(declaration).toBeUndefined();
      });
    });

    it('gets the MemberExpression parameter id', async () => {
      await run('parameter-member-expression', (fn, classPath) => {
        const [id, declaration] = hoistFunctionParameter(
          fn,
          'param',
          classPath.parentPath.scope,
        );

        expect(isMemberExpression(id)).toBeTruthy();
        expect(generate(id).code).toBe('utils.fn');
        expect(declaration).toBeUndefined();
      });
    });

    it('changes the id of the hoisted parameter to be unique', async () => {
      await run('parameter-identifier-unique-name', (fn, classPath) => {
        const [id] = hoistFunctionParameter(
          fn,
          'someUniqueVar',
          classPath.parentPath.scope,
        );

        expect(isIdentifier(id)).toBeTruthy();
        expect((id as Identifier).name).toBe('_someUniqueVar2');
      });
    });
  });
});
