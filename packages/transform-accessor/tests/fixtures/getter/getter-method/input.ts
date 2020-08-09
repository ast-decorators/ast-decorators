import {getter} from '../../../../src';

// @ts-ignore
class Foo {
  #bar: string = '10';

  @getter()
  public get bar(): string {
    return this.#bar;
  }
}
