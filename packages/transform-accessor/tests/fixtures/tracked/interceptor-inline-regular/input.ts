import {tracked} from '../../../../src';

// @ts-ignore
class Foo {
  @tracked(function (value: string): string {
    console.log(value);

    return value;
  })
  public bar?: string;
}
