import {accessor} from '../../../../src';

// @ts-ignore
class Foo {
  @accessor(
    (value: string) => `_${value}`,
    (value: string) => value.slice(1),
  )
  public bar?: string;
}
