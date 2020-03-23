import {AccessorInterceptor} from './utils';

export type AccessorDecorator = (
  get?: AccessorInterceptor,
  set?: AccessorInterceptor,
) => PropertyDecorator;

export type GetterDecorator = (get?: AccessorInterceptor) => PropertyDecorator;
export type SetterDecorator = (set?: AccessorInterceptor) => PropertyDecorator;

export const accessor: AccessorDecorator = () => () => undefined;
export const getter: GetterDecorator = () => () => undefined;
export const setter: SetterDecorator = () => () => undefined;
