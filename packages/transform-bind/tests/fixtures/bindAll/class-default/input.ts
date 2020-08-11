import {bindAll} from '../../../../src';

@bindAll
// @ts-ignore
class Foo {
  public bar() {}

  public *baz() {}

  public async buzz() {}

  // @ts-ignore
  #baz() {}

  // @ts-ignore
  *#fuzz() {}

  public static bar2() {}

  public static *baz2() {}

  public static async buzz2() {}

  // @ts-ignore
  static #baz2() {}

  // @ts-ignore
  static *#fuzz2() {}
}
