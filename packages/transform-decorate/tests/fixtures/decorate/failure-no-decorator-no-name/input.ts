import {decorate} from '../../../../src';

const baz = true;

// @ts-ignore
class Foo {
  // @ts-ignore
  @decorate()
  public [baz ? 'bar1' : 'bar2'](num: number) {
    return num * num;
  }
}
