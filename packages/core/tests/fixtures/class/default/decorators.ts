export type ElementDecoratorOptions = {
  extends: string;
};

export type ElementDecorator = (
  name: string,
  options?: ElementDecoratorOptions,
) => ClassDecorator;

export const element: ElementDecorator = () => () => undefined;
