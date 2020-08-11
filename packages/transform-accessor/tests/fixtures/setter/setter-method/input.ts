import {setter} from '../../../../src';

// @ts-ignore
class Foo {
  // @ts-ignore
  #bar: string = '10';

  @setter()
  public set bar(value: string) {
    this.#bar = value;
  }
}
