import {decorate} from '../../../../src';

// @ts-ignore
class Foo {
  @decorate(function (this: Foo, fn) {
    return function (...args) {
      const result = fn.apply(this, args);
      console.log(result);

      return result;
    };
  })
  public bar(num: number) {
    return num * num;
  }
}
