import {decorate} from '../../../../src';

function decorator(fn: Foo['bar']) {
  return function (this: Foo, ...args: any[]) {
    const result = fn.apply(this, args);
    console.log(result);

    return result;
  };
}

// @ts-ignore
class Foo {
  @decorate(decorator)
  public bar(num: number) {
    return num * num;
  }
}
