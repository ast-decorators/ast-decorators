import {decorate} from '../../../../src';

// @ts-ignore
class Foo {
  // @ts-ignore
  @decorate()
  public bar(num: number) {
    return num * num;
  }
}
