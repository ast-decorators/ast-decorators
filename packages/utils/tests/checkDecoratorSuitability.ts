import template from '@babel/template';
import {
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
} from '@babel/types';
import {resolve} from 'path';
import checkDecoratorSuitability from '../src/checkDecoratorSuitability';

describe('@ast-decorators/utils', () => {
  describe('checkDecoratorSuitability', () => {
    const filename = resolve(__dirname, 'input.ts');

    describe('names', () => {
      it('detects if import specifier is listed in "names" factor in a string form', () => {
        const importDeclaration = template.statement(
          "import {positive, negative} from 'foo'",
        )() as ImportDeclaration;

        const [firstSpecifier, secondSpecifier] = importDeclaration.specifiers;

        const check = (
          specifier:
            | ImportSpecifier
            | ImportDefaultSpecifier
            | ImportNamespaceSpecifier,
        ): boolean =>
          checkDecoratorSuitability(
            specifier,
            importDeclaration.source,
            filename,
            {
              names: ['positive'],
            },
          );

        expect(check(firstSpecifier)).toBeTruthy();
        expect(check(secondSpecifier)).not.toBeTruthy();
      });

      it('detects if import specifier fits regular expression', () => {
        const importDeclaration = template.statement(
          "import {negative, $positive} from 'foo'",
        )() as ImportDeclaration;

        const check = (
          specifier:
            | ImportSpecifier
            | ImportDefaultSpecifier
            | ImportNamespaceSpecifier,
        ): boolean =>
          checkDecoratorSuitability(
            specifier,
            importDeclaration.source,
            filename,
            {
              names: [/\$\w+/],
            },
          );

        const [firstSpecifier, secondSpecifier] = importDeclaration.specifiers;

        expect(check(firstSpecifier)).not.toBeTruthy();
        expect(check(secondSpecifier)).toBeTruthy();
      });
    });

    describe('paths', () => {
      it('detects if import source fits the glob expression', () => {
        const [positiveDeclaration, negativeDeclaration] = template(`
          import {foo} from '../../file.positive';
          import {foo2} from '../../file.negative';
        `)() as readonly ImportDeclaration[];

        const check = ({
          specifiers: [specifier],
          source,
        }: ImportDeclaration): boolean =>
          checkDecoratorSuitability(specifier, source, filename, {
            paths: ['packages/**/*.positive'],
          });

        expect(check(positiveDeclaration)).toBeTruthy();
        expect(check(negativeDeclaration)).not.toBeTruthy();
      });

      it('ignores "node_module" paths', () => {
        const [negativeDeclaration, positiveDeclaration] = template(`
          import {foo} from 'some-module/path/to/file.positive';
          import {foo2} from '../../file.positive';
        `)() as readonly ImportDeclaration[];

        const check = ({
          specifiers: [specifier],
          source,
        }: ImportDeclaration): boolean =>
          checkDecoratorSuitability(specifier, source, filename, {
            paths: ['**/*.positive'],
          });

        expect(check(negativeDeclaration)).not.toBeTruthy();
        expect(check(positiveDeclaration)).toBeTruthy();
      });
    });

    describe('nodeModules', () => {
      it('detects if import source starts with specified string', () => {
        const [positiveDeclaration, negativeDeclaration] = template(`
          import {foo} from 'positive-module/path/to/file';
          import {foo2} from 'negative-module/path/to/file';
        `)() as readonly ImportDeclaration[];

        const check = ({
          specifiers: [specifier],
          source,
        }: ImportDeclaration): boolean =>
          checkDecoratorSuitability(specifier, source, filename, {
            nodeModules: ['positive-module'],
          });

        expect(check(positiveDeclaration)).toBeTruthy();
        expect(check(negativeDeclaration)).not.toBeTruthy();
      });

      it('detects if import source fits the glob expression', () => {
        const [positiveDeclaration, negativeDeclaration] = template(`
          import {foo} from 'neutral-module/positive-path/to/file';
          import {foo2} from 'neutral-module/negative-path/to/file';
        `)() as readonly ImportDeclaration[];

        const check = ({
          specifiers: [specifier],
          source,
        }: ImportDeclaration): boolean =>
          checkDecoratorSuitability(specifier, source, filename, {
            nodeModules: ['neutral-module/positive-path/**/*'],
          });

        expect(check(positiveDeclaration)).toBeTruthy();
        expect(check(negativeDeclaration)).not.toBeTruthy();
      });

      it('detects if import source fits the regular expression', () => {
        const [positiveDeclaration, negativeDeclaration] = template(`
          import {foo} from 'neutral-module/positive-path/to/file';
          import {foo2} from 'neutral-module/negative-path/to/file';
        `)() as readonly ImportDeclaration[];

        const check = ({
          specifiers: [specifier],
          source,
        }: ImportDeclaration): boolean =>
          checkDecoratorSuitability(specifier, source, filename, {
            nodeModules: [/positive/],
          });

        expect(check(positiveDeclaration)).toBeTruthy();
        expect(check(negativeDeclaration)).not.toBeTruthy();
      });
    });
  });
});
