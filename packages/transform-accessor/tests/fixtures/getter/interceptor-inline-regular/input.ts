import {getter} from '../../../../src';

// @ts-ignore
class Foo {
  @getter(function (value: string): string {
    console.log(value);

    return value;
  })
  public bar?: string;
}
