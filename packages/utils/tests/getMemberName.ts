import {parse as _parse} from '../../../utils/testing';
import {ClassMember} from '../src/common';
import getMemberName from '../src/getMemberName';
import {NodePath, traverse} from '@babel/core';
import options from './fixtures/getMemberName/options';

const parse = async (fixture: string): ReturnType<typeof _parse> =>
  _parse(__dirname, 'getMemberName', fixture, options);

const run = async (
  fixture: string,
  callback: (member: ClassMember) => void,
): Promise<void> => {
  const ast = await parse(fixture);

  await new Promise(resolve => {
    traverse(ast!, {
      // @ts-ignore
      'ClassProperty|ClassPrivateProperty|ClassMethod|ClassPrivateMethod'(
        path: NodePath<ClassMember>,
      ) {
        // eslint-disable-next-line callback-return
        callback(path.node);
        resolve();
      },
    });
  });
};

describe('@ast-decorators/utils', () => {
  describe('getMemberName', () => {
    it('gets a name for a regular property', async () => {
      await run('regular-property', member => {
        expect(getMemberName(member)).toBe('bar');
      });
    });

    it('gets a name for a private property', async () => {
      await run('private-property', member => {
        expect(getMemberName(member)).toBe('bar');
      });
    });

    it('gets a name for a computed property', async () => {
      await run('computed-property', member => {
        expect(getMemberName(member)).toBe('bar');
      });
    });

    it('gets a name for a string literal property', async () => {
      await run('string-literal-property', member => {
        expect(getMemberName(member)).toBe('str-bar');
      });
    });

    it('gets a name for a numeric literal property', async () => {
      await run('numeric-literal-property', member => {
        expect(getMemberName(member)).toBe(42);
      });
    });

    it('gets null for a property which key is an expression', async () => {
      await run('expression-property', member => {
        expect(getMemberName(member)).toBeUndefined();
      });
    });
  });
});
