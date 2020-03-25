export type CallableClassDecorator = () => ClassDecorator;

export const foo: CallableClassDecorator = () => () => void 0;
export const bar: ClassDecorator = () => void 0;
