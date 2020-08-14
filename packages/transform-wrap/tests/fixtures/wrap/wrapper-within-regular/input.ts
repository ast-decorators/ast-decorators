import {wrap} from '../../../../src';

function wrapper(fn: Foo['bar']) {
  return function (this: Foo, ...args: any[]) {
    const result = fn.apply(this, args);
    console.log(result);

    return result;
  };
}

// @ts-ignore
class Foo {
  @wrap(wrapper)
  public bar(num: number) {
    return num * num;
  }
}
