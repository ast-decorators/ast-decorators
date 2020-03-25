export type FooDecorator = (name: string) => ClassDecorator;

export const foo: FooDecorator = () => () => void 0;
