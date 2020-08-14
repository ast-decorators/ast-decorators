import {transformFile as _transformFile} from '../../../utils/testing';
import {bindAll} from '../src';
import commonOptions from './fixtures/options';

const transformFile = async (
  fixture: string,
  options?: string | object,
): ReturnType<typeof _transformFile> =>
  _transformFile(__dirname, 'bindAll', fixture, options);

describe('@ast-decorators/transform-bind', () => {
  describe('@bindAll', () => {
    it('compiles for all methods in class', async () => {
      const {code} = await transformFile('class-default', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('fails if decorator applied to something other than class', async () => {
      await expect(
        transformFile('failure-no-class', commonOptions),
      ).rejects.toThrowError(
        'Applying @bindAll decorator to something other than class is not allowed',
      );
    });

    it('fails if transformer is not plugged in', () => {
      // @ts-expect-error: Here the runtime replacement used. It does not
      // require arguments
      expect(() => bindAll()()).toThrowError(
        "Decorator @bindAll won't work because @ast-decorators/transform-bind/lib/transformer" +
          'is not plugged in. You have to add it to your Babel config',
      );
    });
  });
});
