import replaceDecorator from '@ast-decorators/utils/lib/replaceDecorator';
import type {AccessorInterceptor} from './utils';

export type AccessorDecorator = (
  get?: AccessorInterceptor,
  set?: AccessorInterceptor,
) => PropertyDecorator;

export type GetterDecorator = (get?: AccessorInterceptor) => PropertyDecorator;
export type SetterDecorator = (set?: AccessorInterceptor) => PropertyDecorator;

const transformerName = '@ast-decorators/transform-accessor';

export const accessor = replaceDecorator(
  'accessor',
  transformerName,
) as AccessorDecorator;

export const getter = replaceDecorator(
  'getter',
  transformerName,
) as GetterDecorator;

export const setter = replaceDecorator(
  'setter',
  transformerName,
) as SetterDecorator;
