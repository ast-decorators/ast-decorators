import {setter} from '../../../../src';

// @ts-ignore
class Foo {
  @setter((value: string) => {
    console.log(value);

    return value;
  })
  public bar?: string;
}
