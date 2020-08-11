import {setter} from '../../../../src';
// @ts-ignore
import {set} from './set';

// @ts-ignore
class Foo {
  // @ts-ignore
  #bar: (() => string) | undefined;
  #baz = '10';

  @setter(set)
  public set bar(value: string) {
    const self = this;

    this.#bar = function () {
      return self.#baz + value;
    };
  }
}
