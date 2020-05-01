import {transformFile as _transformFile} from '../../../utils/testing';
import commonOptions from './fixtures/options';

const transformFile = async (
  fixture: string,
  options?: string | object,
): ReturnType<typeof _transformFile> =>
  _transformFile(__dirname, 'decorate', fixture, options);

describe('@ast-decorators/transform-decorate', () => {
  describe('@decorate', () => {
    it('compiles for a method with inline arrow decorator', async () => {
      const {code} = await transformFile('method-inline-arrow', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('compiles for a method with inline regular decorator', async () => {
      const {code} = await transformFile(
        'method-inline-regular',
        commonOptions,
      );
      expect(code).toMatchSnapshot();
    });

    it('compiles for a method with decorator declared in the same file as an arrow function', async () => {
      const {code} = await transformFile('method-within-arrow', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('compiles for a method with decorator declared in the same file as a regular function', async () => {
      const {code} = await transformFile(
        'method-within-regular',
        commonOptions,
      );
      console.log(code);
      expect(code).toMatchSnapshot();
    });

    it('compiles for a method with decorator imported from an external file', async () => {
      const {code} = await transformFile(
        'method-import-default',
        commonOptions,
      );
      expect(code).toMatchSnapshot();
    });

    it('compiles for a method with multiple decorators', async () => {
      const {code} = await transformFile('multiple-decorators', commonOptions);
      expect(code).toMatchSnapshot();
    });

    it('sends arguments to a decorator function', async () => {
      const {code} = await transformFile('decorator-args', commonOptions);
      expect(code).toMatchSnapshot();
    });
  });
});
