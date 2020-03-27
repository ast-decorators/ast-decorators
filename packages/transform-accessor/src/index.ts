import ASTDecoratorsError from '@ast-decorators/utils/lib/ASTDecoratorsError';
import {AccessorInterceptor} from './utils/misc';

export type AccessorDecorator = (
  get?: AccessorInterceptor,
  set?: AccessorInterceptor,
) => PropertyDecorator;

export type GetterDecorator = (get?: AccessorInterceptor) => PropertyDecorator;
export type SetterDecorator = (set?: AccessorInterceptor) => PropertyDecorator;

const replacement = (type: string) => () => () => {
  throw new ASTDecoratorsError(
    `Decorator @${type} won't work because @ast-decorators/transform-accessor/lib/transformer` +
      'is not plugged in. You have to add it to your Babel config',
  );
};

export const accessor: AccessorDecorator = replacement('accessor');
export const getter: GetterDecorator = replacement('getter');
export const setter: SetterDecorator = replacement('setter');
