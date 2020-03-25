export type FooDecorator = (name: string, value: string) => ClassDecorator;

export const foo: FooDecorator = () => () => void 0;
