import replaceDecorator from '@ast-decorators/utils/lib/replaceDecorator';
import {AccessorInterceptor} from './utils';

export type AccessorDecorator = (
  get?: AccessorInterceptor,
  set?: AccessorInterceptor,
) => PropertyDecorator;

export type GetterDecorator = (get?: AccessorInterceptor) => PropertyDecorator;
export type SetterDecorator = (set?: AccessorInterceptor) => PropertyDecorator;

const transformerName = '@ast-decorators/transform-accessor';

export const accessor: AccessorDecorator = replaceDecorator(
  'accessor',
  transformerName,
);

export const getter: GetterDecorator = replaceDecorator(
  'getter',
  transformerName,
);

export const setter: SetterDecorator = replaceDecorator(
  'setter',
  transformerName,
);
