import {setter} from '../../../../src';

// @ts-ignore
class Foo {
  @setter(function(value: string): string {
    console.log(value);

    return value;
  })
  public bar?: string;
}
