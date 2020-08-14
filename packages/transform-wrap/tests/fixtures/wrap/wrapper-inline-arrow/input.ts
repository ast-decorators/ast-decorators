import {wrap} from '../../../../src';

// @ts-ignore
class Foo {
  @wrap(fn => function (...args) {
    const result = fn.apply(this, args);
    console.log(result);

    return result;
  })
  public bar(num: number) {
    return num * num;
  }
}
