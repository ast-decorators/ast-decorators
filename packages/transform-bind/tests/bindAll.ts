import {compare as _compare} from '../../../utils/testing';
import commonOptions from './fixtures/options';

const compare = async (
  fixture: string,
  options?: string | object,
): Promise<void> => _compare(__dirname, 'bindAll', fixture, options);

describe('@ast-decorators/transform-bind', () => {
  describe('@bindAll', () => {
    it('compiles for all methods in class', async () => {
      await compare('default', commonOptions);
    });
  });
});
