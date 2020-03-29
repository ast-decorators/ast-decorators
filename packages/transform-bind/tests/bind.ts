import {compare as _compare} from '../../../utils/testing';
import commonOptions from './fixtures/options';

const compare = async (
  fixture: string,
  options?: string | object,
): Promise<void> => _compare(__dirname, 'bind', fixture, options);

describe('@ast-decorators/transform-bind', () => {
  describe('@bind', () => {
    it('compiles for regular method', async () => {
      await compare('default', commonOptions);
    });

    it('compiles for private method', async () => {
      await compare('private-method', commonOptions);
    });
  });
});
