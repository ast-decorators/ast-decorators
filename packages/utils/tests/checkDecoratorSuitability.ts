import {resolve} from 'path';
import checkDecoratorSuitability, {
  DecoratorInfo,
  NotFileEnvironmentError,
} from '../src/checkDecoratorSuitability';

describe('@ast-decorators/utils', () => {
  describe('checkDecoratorSuitability', () => {
    describe('names', () => {
      it('detects if import specifier is listed in "names" factor in a string form', () => {
        const check = (name: string): boolean =>
          checkDecoratorSuitability(
            {name, source: 'foo'},
            {names: ['positive']},
          );

        expect(check('positive')).toBeTruthy();
        expect(check('negative')).not.toBeTruthy();
      });

      it('detects if import specifier fits regular expression', () => {
        const check = (name: string): boolean =>
          checkDecoratorSuitability({name, source: 'foo'}, {names: [/\$\w+/]});

        expect(check('negative')).not.toBeTruthy();
        expect(check('$positive')).toBeTruthy();
      });
    });

    describe('paths', () => {
      const filename = resolve(__dirname, 'input.ts');

      it('detects if import source fits the glob expression', () => {
        const check = (info: DecoratorInfo): boolean =>
          checkDecoratorSuitability(
            info,
            {paths: ['packages/**/*.positive']},
            filename,
          );

        expect(check({source: '../../file.positive'})).toBeTruthy();
        expect(check({source: '../../file.negative'})).not.toBeTruthy();
      });

      it('ignores "node_module" paths', () => {
        const check = (info: DecoratorInfo): boolean =>
          checkDecoratorSuitability(info, {paths: ['**/*.positive']}, filename);

        expect(
          check({source: 'some-module/path/to/file.positive'}),
        ).not.toBeTruthy();
        expect(check({source: '../../file.positive'})).toBeTruthy();
      });

      it('throws a NotFileEnvironmentError if the "filename" is not provided', () => {
        expect(() =>
          checkDecoratorSuitability(
            {source: '../../file.positive'},
            {paths: ['**/*.positive']},
          ),
        ).toThrow(NotFileEnvironmentError);
      });
    });

    describe('nodeModules', () => {
      it('detects if import source starts with specified string', () => {
        const check = (info: DecoratorInfo): boolean =>
          checkDecoratorSuitability(info, {nodeModules: ['positive-module']});

        expect(check({source: 'positive-module/path/to/file'})).toBeTruthy();
        expect(
          check({source: 'negative-module/path/to/file'}),
        ).not.toBeTruthy();
      });

      it('detects if import source fits the glob expression', () => {
        const check = (info: DecoratorInfo): boolean =>
          checkDecoratorSuitability(info, {
            nodeModules: ['neutral-module/positive-path/**/*'],
          });

        expect(
          check({source: 'neutral-module/positive-path/to/file'}),
        ).toBeTruthy();
        expect(
          check({source: 'neutral-module/negative-path/to/file'}),
        ).not.toBeTruthy();
      });

      it('detects if import source fits the regular expression', () => {
        const check = (info: DecoratorInfo): boolean =>
          checkDecoratorSuitability(info, {nodeModules: [/positive/]});

        expect(
          check({source: 'neutral-module/positive-path/to/file'}),
        ).toBeTruthy();
        expect(
          check({source: 'neutral-module/negative-path/to/file'}),
        ).not.toBeTruthy();
      });
    });
  });
});
