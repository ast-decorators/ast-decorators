import generate from '@babel/generator';
import {
  blockStatement,
  ClassPrivateProperty,
  classPrivateProperty as _classPrivateProperty,
  cloneNode as _cloneNode,
  identifier,
  numericLiteral,
  privateName,
  tsNumberKeyword,
  tsTypeAnnotation,
} from '@babel/types';
import {
  classPrivateMethod,
  classPrivateProperty,
  cloneNode,
  classMethod,
} from '../src/babelFixes';

describe('babelFixes', () => {
  describe('cloneNode', () => {
    it('fixes copying the ClassPrivateProperty "static" property', () => {
      const node: ClassPrivateProperty = _classPrivateProperty(
        privateName(identifier('foo')),
        null,
      );
      // @ts-expect-error: Babel d.ts file does not include "static" for
      // ClassPrivateProperty.
      node.static = true;

      // @ts-expect-error: Babel d.ts file does not include "static" for
      // ClassPrivateProperty.
      expect(_cloneNode(node).static).not.toBeTruthy();
      // @ts-expect-error: Babel d.ts file does not include "static" for
      // ClassPrivateProperty.
      expect(cloneNode(node).static).toBeTruthy();
    });
  });

  describe('classMethod', () => {
    it('allows creating method with decorators', () => {
      const node = classMethod(
        'method',
        identifier('foo'),
        [],
        blockStatement([]),
        null,
        false,
        true,
        true,
        true,
      );

      expect(generate(node).code).toBe('static async *foo() {}');
    });
  });

  describe('classPrivateProperty', () => {
    it('allows creating private property with the same interface as regular property', () => {
      const node = classPrivateProperty(
        privateName(identifier('foo')),
        numericLiteral(10),
        tsTypeAnnotation(tsNumberKeyword()),
        null,
        true,
      );

      expect(generate(node).code).toBe('static #foo: number = 10;');
    });
  });

  describe('classPrivateMethod', () => {
    it('allows creating private method with the same interface as regular method', () => {
      const node = classPrivateMethod(
        'method',
        privateName(identifier('foo')),
        [],
        blockStatement([]),
        null,
        true,
        true,
        true,
      );

      expect(generate(node).code).toBe('static async *#foo() {}');
    });
  });
});
