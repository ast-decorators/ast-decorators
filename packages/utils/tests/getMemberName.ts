/* eslint-disable capitalized-comments */
import {
  binaryExpression,
  blockStatement,
  classMethod,
  classPrivateMethod,
  classPrivateProperty,
  classProperty,
  conditionalExpression,
  identifier,
  numericLiteral,
  privateName,
  stringLiteral,
} from '@babel/types';
import getMemberName from '../src/getMemberName';

describe('@ast-decorators/utils', () => {
  describe('getMemberName', () => {
    it('gets name for regular class property', () => {
      const name = 'foo';

      /*
       * class Bar {
       *  foo = 10;
       * }
       */
      const prop = classProperty(identifier(name), numericLiteral(10));

      expect(getMemberName(prop)).toBe(name);
    });

    it('gets name for class method', () => {
      const name = 'foo';

      /*
       * class Bar {
       *  foo() {}
       * }
       */
      const method = classMethod(
        'method',
        identifier(name),
        [],
        blockStatement([]),
      );

      expect(getMemberName(method)).toBe(name);
    });

    it('gets name if property is a computed string literal', () => {
      const name = 'foo';

      /*
       * class Bar {
       *  'foo' = 10;
       * }
       */
      const prop = classProperty(stringLiteral(name), numericLiteral(10));

      expect(getMemberName(prop)).toBe(name);
    });

    it('gets name if property is a numeric literal', () => {
      const name = 42;

      /*
       * class Bar {
       *  42 = 10;
       * }
       */
      const prop = classProperty(numericLiteral(name), numericLiteral(10));

      expect(getMemberName(prop)).toBe(name);
    });

    it('gets name if member is a private property', () => {
      const name = 'foo';

      /*
       * class Bar {
       *  #foo = 10;
       * }
       */
      const prop = classPrivateProperty(
        privateName(identifier(name)),
        numericLiteral(10),
      );

      expect(getMemberName(prop)).toBe(name);
    });

    it('gets name if member is a private method', () => {
      const name = 'foo';

      /*
       * class Bar {
       *  #foo() {}
       * }
       */
      const prop = classPrivateMethod(
        'method',
        privateName(identifier(name)),
        [],
        blockStatement([]),
      );

      expect(getMemberName(prop)).toBe(name);
    });

    it('gets undefined if member has computed expression name', () => {
      /*
       * class Bar {
       *  [foo > 0 ? 'baz' : 42] = 10
       * }
       */
      const prop = classProperty(
        conditionalExpression(
          binaryExpression('>', identifier('foo'), numericLiteral(0)),
          stringLiteral('baz'),
          numericLiteral(42),
        ),
        numericLiteral(10),
        null,
        null,
        true,
      );

      expect(getMemberName(prop)).toBeUndefined();
    });
  });
});
