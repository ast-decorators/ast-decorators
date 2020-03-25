export type FooDecorator = (...params: any[]) => ClassDecorator;

export const foo: FooDecorator = () => () => void 0;
