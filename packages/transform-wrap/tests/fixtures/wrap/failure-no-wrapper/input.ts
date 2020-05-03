import {wrap} from '../../../../src';

// @ts-ignore
class Foo {
  // @ts-ignore
  @wrap()
  public bar(num: number) {
    return num * num;
  }
}
