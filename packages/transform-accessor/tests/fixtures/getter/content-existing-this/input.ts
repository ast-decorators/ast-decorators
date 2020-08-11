import {getter} from '../../../../src';
// @ts-ignore
import {get} from './get';

// @ts-ignore
class Foo {
  #bar: string = '10';

  @getter(get)
  public get bar(): () => string {
    const self = this;

    return function () {
      return self.#bar;
    };
  }
}
