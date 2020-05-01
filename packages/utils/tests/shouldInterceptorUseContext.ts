/* eslint-disable max-nested-callbacks */
import {NodePath, traverse} from '@babel/core';
import {CallExpression, Decorator} from '@babel/types';
import {resolve} from 'path';
import {parse as _parse} from '../../../utils/testing';
import shouldInterceptorUseContext, {
  InterceptorKind,
} from '../src/shouldInterceptorUseContext';
import options from './fixtures/shouldInterceptorUseContext/options';

const parse = async (fixture: string): ReturnType<typeof _parse> =>
  _parse(__dirname, 'shouldInterceptorUseContext', fixture, options);

const run = async (
  fixture: string,
  callback: (args: NodePath<InterceptorKind>, filename: string) => void,
): Promise<void> => {
  const ast = await parse(fixture);
  const filename = resolve(
    __dirname,
    'shouldInterceptorUseContext',
    fixture,
    'input.ts',
  );

  return new Promise(done => {
    traverse(ast!, {
      Decorator(path: NodePath<Decorator>) {
        const expression = path.get('expression') as NodePath<CallExpression>;
        const [fn] = expression.get('arguments') as ReadonlyArray<
          NodePath<InterceptorKind>
        >;

        // eslint-disable-next-line callback-return
        callback(fn, filename);

        done();
      },
    });
  });
};

describe('@ast-decorators/utils', () => {
  describe('shouldInterceptorUseContext', () => {
    it('returns false if no function received', () => {
      expect(shouldInterceptorUseContext(undefined, undefined, '')).toBeFalsy();
    });

    it('returns false for inline arrow function interceptor', async () => {
      await run('context-inline-arrow', (fn, filename) => {
        expect(
          shouldInterceptorUseContext(fn, undefined, filename),
        ).toBeFalsy();
      });
    });

    it('returns true for inline regular function interceptor', async () => {
      await run('context-inline-regular', (fn, filename) => {
        expect(
          shouldInterceptorUseContext(fn, undefined, filename),
        ).toBeTruthy();
      });
    });

    it('returns false for in-file arrow function interceptor', async () => {
      await run('context-within-arrow', (fn, filename) => {
        expect(
          shouldInterceptorUseContext(fn, undefined, filename),
        ).toBeFalsy();
      });
    });

    it('returns true for in-file regular function interceptor (expression)', async () => {
      await run('context-within-regular', (fn, filename) => {
        expect(
          shouldInterceptorUseContext(fn, undefined, filename),
        ).toBeTruthy();
      });
    });

    it('returns true for in-file regular function interceptor (declaration)', async () => {
      await run('context-within-declaration', (fn, filename) => {
        expect(
          shouldInterceptorUseContext(fn, undefined, filename),
        ).toBeTruthy();
      });
    });

    it('returns true for imported interceptor by default', async () => {
      await run('context-import-default', (fn, filename) => {
        expect(
          shouldInterceptorUseContext(fn, undefined, filename),
        ).toBeTruthy();
      });
    });

    it('returns false for imported interceptor if "disableByDefault" is set', async () => {
      await run('context-import-disabled', (fn, filename) => {
        expect(
          shouldInterceptorUseContext(fn, {disableByDefault: true}, filename),
        ).toBeFalsy();
      });
    });

    it('returns false for imported interceptor if it fits "exclude" options', async () => {
      await run('context-import-ignored', (fn, filename) => {
        expect(
          shouldInterceptorUseContext(
            fn,
            {
              exclude: {
                names: ['markedGetter'],
              },
            },
            filename,
          ),
        ).toBeFalsy();
      });
    });

    it('returns true for imported interceptor if it fits "exclude" options and "disableByDefault" is set', async () => {
      await run('context-import-disabled-ignored', (fn, filename) => {
        expect(
          shouldInterceptorUseContext(
            fn,
            {
              disableByDefault: true,
              exclude: {
                names: ['markedGetter'],
              },
            },
            filename,
          ),
        ).toBeTruthy();
      });
    });

    it('uses global settings if the function is a part of object declaration', async () => {
      await run('context-object-part', (fn, filename) => {
        expect(
          shouldInterceptorUseContext(fn, undefined, filename),
        ).toBeTruthy();
      });
    });

    it('fails if in-file interceptor is not a function', async () => {
      await run('context-error-not-function', (fn, filename) => {
        expect(() =>
          shouldInterceptorUseContext(fn, undefined, filename),
        ).toThrowError('get is not a function');
      });
    });

    it('fails if interceptor is not defined', async () => {
      await run('context-error-not-defined', (fn, filename) => {
        expect(() =>
          shouldInterceptorUseContext(fn, undefined, filename),
        ).toThrowError('get is not defined');
      });
    });
  });
});
