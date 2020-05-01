import replaceDecorator from '@ast-decorators/utils/lib/replaceDecorator';

const transformerName = '@ast-decorators/transform-decorate';

export const decorate: <
  A extends any[],
  F extends (this: object | void, ...args: A) => any
>(
  decorator: (fn: F, ...args: A) => F,
  ...args: A
) => PropertyDecorator = replaceDecorator('decorate', transformerName);
