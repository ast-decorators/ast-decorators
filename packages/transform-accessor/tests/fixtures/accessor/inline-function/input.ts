import {accessor} from '../../../../src';

// @ts-ignore
class Foo {
  @accessor(
    function(value: string): string {
      return `_${value}`;
    },
    function(value: string): string {
      return value.slice(1);
    },
  )
  public bar?: string;
}
