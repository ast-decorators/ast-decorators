// @ts-ignore
import {bind} from '../../../../src';

// @ts-ignore
class Foo {
  // @ts-ignore
  @bind
  // @ts-ignore
  static *bar() {
    console.log(this);
  }
}
