import replaceDecorator from '@ast-decorators/utils/lib/replaceDecorator';

const transformerName = '@ast-decorators/transform-bind';

export const bind: PropertyDecorator = replaceDecorator(
  'bind',
  transformerName,
);

export const bindAll: ClassDecorator = replaceDecorator(
  'bindAll',
  transformerName,
);
