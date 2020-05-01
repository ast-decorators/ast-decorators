import replaceDecorator from '../src/replaceDecorator';

describe('@ast-decorators/utils', () => {
  describe('replaceDecorator', () => {
    it('fails on call with correct message', () => {
      expect(() =>
        replaceDecorator('foo', '@ast-decorators/bar')(),
      ).toThrowError(
        "Decorator @foo won't work because @ast-decorators/bar/lib/transformer" +
          'is not plugged in. You have to add it to your Babel config',
      );
    });
  });
});
