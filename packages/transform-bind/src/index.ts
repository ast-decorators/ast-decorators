import replaceDecorator from '@ast-decorators/utils/lib/replaceDecorator';

const transformerName = '@ast-decorators/transform-bind';

export const bind = replaceDecorator(
  'bind',
  transformerName,
) as PropertyDecorator;

export const bindAll = replaceDecorator(
  'bindAll',
  transformerName,
) as ClassDecorator;
