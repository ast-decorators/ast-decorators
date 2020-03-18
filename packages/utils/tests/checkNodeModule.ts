import checkNodeModule from '../src/checkNodeModule';

describe('@ast-decorators/utils', () => {
  describe('checkNodeModule', () => {
    it('fails if module starts with "./"', () => {
      expect(checkNodeModule('./path/to/file')).toBeFalsy();
    });

    it('fails if module starts with "../"', () => {
      expect(checkNodeModule('../../path/to/file')).toBeFalsy();
    });

    it('fails if module starts with "/"', () => {
      expect(checkNodeModule('/path/to/file')).toBeFalsy();
    });

    it('succeeds if module starts with any other symbol', () => {
      expect(checkNodeModule('@ast-decorators/utils')).not.toBeFalsy();
      expect(checkNodeModule('some-module/utils')).not.toBeFalsy();
    });
  });
});
