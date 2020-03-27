import {getter} from '../../../../src';

// @ts-ignore
class Foo {
  @getter((value: string) => {
    console.log(value);

    return value;
  })
  public bar?: string;
}
