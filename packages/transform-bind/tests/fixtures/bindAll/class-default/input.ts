import {bindAll} from '../../../../src';

@bindAll
// @ts-ignore
class Foo {
  public bar() {}

  // @ts-ignore
  #baz() {}

  // @ts-ignore
  *#fuzz() {}
}
