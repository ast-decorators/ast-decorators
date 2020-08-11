import {setter} from '../../../../src';
// @ts-ignore
import {set} from './set';

// @ts-ignore
class Foo {
  // @ts-ignore
  #bar: string | undefined;

  @setter(set)
  public set bar({foo}: {foo: string}) {
    this.#bar = foo;
  }
}
