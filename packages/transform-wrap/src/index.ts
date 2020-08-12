import replaceDecorator from '@ast-decorators/utils/lib/replaceDecorator';

const transformerName = '@ast-decorators/transform-wrap';

export const wrap: <
  A extends any[],
  F extends (this: object | undefined, ...args: A) => any
>(
  wrapper: (fn: F, ...args: A) => F,
  ...args: A
) => PropertyDecorator = replaceDecorator('wrap', transformerName) as any;
