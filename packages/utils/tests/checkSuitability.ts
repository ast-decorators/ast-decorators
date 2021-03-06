import {resolve} from 'path';
import checkSuitability, {CheckingElementInfo} from '../src/checkSuitability';

describe('@ast-decorators/utils', () => {
  describe('checkSuitability', () => {
    const filename = resolve(__dirname, 'input.ts');

    it('allows to omit factors', () => {
      expect(
        checkSuitability({name: 'bar', source: 'foo'}, undefined, filename),
      ).toBeFalsy();
    });

    describe('names', () => {
      it('detects if import specifier is listed in "names" factor in a string form', () => {
        const check = (name: string): boolean =>
          checkSuitability(
            {name, source: 'foo'},
            {names: ['positive']},
            filename,
          );

        expect(check('positive')).toBeTruthy();
        expect(check('negative')).not.toBeTruthy();
      });

      it('detects if import specifier fits regular expression', () => {
        const check = (name: string): boolean =>
          checkSuitability(
            {name, source: 'foo'},
            {names: [/\$\w+/u]},
            filename,
          );

        expect(check('negative')).not.toBeTruthy();
        expect(check('$positive')).toBeTruthy();
      });
    });

    describe('paths', () => {
      it('detects if import source fits the glob expression', () => {
        const check = (info: CheckingElementInfo): boolean =>
          checkSuitability(info, {paths: ['packages/**/*.positive']}, filename);

        expect(check({source: '../../file.positive'})).toBeTruthy();
        expect(check({source: '../../file.negative'})).not.toBeTruthy();
      });

      it('ignores "node_module" paths', () => {
        const check = (info: CheckingElementInfo): boolean =>
          checkSuitability(info, {paths: ['**/*.positive']}, filename);

        expect(
          check({source: 'some-module/path/to/file.positive'}),
        ).not.toBeTruthy();
        expect(check({source: '../../file.positive'})).toBeTruthy();
      });
    });

    describe('nodeModules', () => {
      it('detects if import source starts with specified string', () => {
        const check = (info: CheckingElementInfo): boolean =>
          checkSuitability(info, {nodeModules: ['positive-module']}, filename);

        expect(check({source: 'positive-module/path/to/file'})).toBeTruthy();
        expect(
          check({source: 'negative-module/path/to/file'}),
        ).not.toBeTruthy();
      });

      it('detects if import source fits the glob expression', () => {
        const check = (info: CheckingElementInfo): boolean =>
          checkSuitability(
            info,
            {nodeModules: ['neutral-module/positive-path/**/*']},
            filename,
          );

        expect(
          check({source: 'neutral-module/positive-path/to/file'}),
        ).toBeTruthy();
        expect(
          check({source: 'neutral-module/negative-path/to/file'}),
        ).not.toBeTruthy();
      });

      it('detects if import source fits the regular expression', () => {
        const check = (info: CheckingElementInfo): boolean =>
          checkSuitability(info, {nodeModules: [/positive/u]}, filename);

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
