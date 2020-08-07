import ASTDecoratorsError from './ASTDecoratorsError';

const replaceDecorator = (name: string, transformer: string) => (): void => {
  throw new ASTDecoratorsError(
    `Decorator @${name} won't work because ${transformer}/lib/transformer` +
      'is not plugged in. You have to add it to your Babel config',
  );
};

export default replaceDecorator;
