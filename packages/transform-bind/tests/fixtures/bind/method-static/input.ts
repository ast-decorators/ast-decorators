import {bind} from '../../../../src';

// @ts-ignore
class Foo {
  @bind
  public static bar() {
    console.log(this);
  }
}
