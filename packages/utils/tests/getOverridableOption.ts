import getOverridableOption from '../src/getOverridableOption';

describe('@ast-decorators/utils', () => {
  describe('getOverridableOption', () => {
    it('gets undefined if there is no option and default value is not defined', () => {
      expect(
        getOverridableOption(undefined, 'privacy', '@ast-decorators/test'),
      ).toBeUndefined();
    });

    it('gets default value if there is no option', () => {
      expect(
        getOverridableOption(
          undefined,
          'privacy',
          '@ast-decorators/test',
          'hard',
        ),
      ).toBe('hard');
    });

    it('gets global option of no overriding for the current plugin provided', () => {
      expect(
        getOverridableOption(
          {
            privacy: 'soft',
          },
          'privacy',
          '@ast-decorators/test',
          'hard',
        ),
      ).toBe('soft');
    });

    it('gets option overridden for current plugin', () => {
      expect(
        getOverridableOption(
          {
            override: {
              '@ast-decorators/test': {
                privacy: 'none',
              },
            },
            privacy: 'soft',
          },
          'privacy',
          '@ast-decorators/test',
          'hard',
        ),
      ).toBe('none');
    });

    it('ignores overrides for other plugins', () => {
      expect(
        getOverridableOption(
          {
            override: {
              '@ast-decorators/wrong': {
                privacy: 'none',
              },
            },
            privacy: 'soft',
          },
          'privacy',
          '@ast-decorators/test',
          'hard',
        ),
      ).toBe('soft');
    });
  });
});
