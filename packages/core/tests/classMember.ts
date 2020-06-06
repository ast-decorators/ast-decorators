import {transformFile as _transformFile} from '../../../utils/testing';

const transformFile = async (
  fixture: string,
): ReturnType<typeof _transformFile> =>
  _transformFile(__dirname, 'class-member', fixture);

describe('@ast-decorators/core', () => {
  describe('class-member', () => {
    it('compiles decorator for a public property', async () => {
      const {code} = await transformFile('public-property');
      expect(code).toMatchSnapshot();
    });

    it('compiles decorator for a private property', async () => {
      const {code} = await transformFile('private-property');
      expect(code).toMatchSnapshot();
    });

    it('compiles decorator for a public method', async () => {
      const {code} = await transformFile('public-method');
      expect(code).toMatchSnapshot();
    });

    it('compiles decorator for a private method', async () => {
      const {code} = await transformFile('private-method');
      expect(code).toMatchSnapshot();
    });

    it('compiles multiple decorators for a method', async () => {
      const {code} = await transformFile('multiple-decorators');
      expect(code).toMatchSnapshot();
    });

    it('compiles decorators imported as a namespace for a method', async () => {
      const {code} = await transformFile('namespace');
      expect(code).toMatchSnapshot();
    });

    it('correctly renders multiple decorators for a class property with replacing', async () => {
      const {code} = await transformFile('disappearing-decorators');
      expect(code).toMatchSnapshot();
    });
  });
});
