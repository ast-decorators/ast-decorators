import {accessor} from '../../../../src';

const get = (value: string) => `_${value}`;
const set = (value: string) => value.slice(1);

// @ts-ignore
class Foo {
  @accessor(get, set)
  public bar?: string;
}
