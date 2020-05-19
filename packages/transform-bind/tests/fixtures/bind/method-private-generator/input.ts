// @ts-ignore
import {bind} from '../../../../src';

// @ts-ignore
class Foo {
  // @ts-ignore
  @bind
  // @ts-ignore
  *#bar() {
    console.log(this);
  }
}
