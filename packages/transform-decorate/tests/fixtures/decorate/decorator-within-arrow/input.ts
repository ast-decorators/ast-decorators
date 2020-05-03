import {decorate} from '../../../../src';

const decorator = (fn: Foo['bar']) =>
  function (this: Foo, ...args: any[]) {
    const result = fn.apply(this, args);
    console.log(result);

    return result;
  };

// @ts-ignore
class Foo {
  @decorate(decorator)
  public bar(num: number) {
    return num * num;
  }
}
