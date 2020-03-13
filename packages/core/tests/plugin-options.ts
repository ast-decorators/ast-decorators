import {compare as _compare} from '../../../utils/testing';

const compare = async (fixture: string): Promise<void> =>
  _compare(__dirname, 'plugin-options', fixture);

describe('@ast-decorators/core', () => {
  describe('plugin-options', () => {
    it('compiles in one way if option has one state', async () => {
      await compare('options-first');
    });

    it('compiles in another way if option has different state', async () => {
      await compare('options-second');
    });

    it('ignores decorator if its name is specified in "exclude" string array', async () => {
      await compare('exclude-name-string');
    });

    it('ignores decorator if its name fits an "exclude" regular expression', async () => {
      await compare('exclude-name-regexp');
    });

    it('ignores decorator if path it is imported from is specified in "paths" exclude option', async () => {
      await compare('exclude-paths');
    });
  });
});
