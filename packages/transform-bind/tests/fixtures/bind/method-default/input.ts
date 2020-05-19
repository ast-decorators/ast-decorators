import {bind} from '../../../../src';

// @ts-ignore
class Foo {
  @bind
  public bar() {
    console.log(this);
  }
}
