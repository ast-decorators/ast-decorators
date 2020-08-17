import {tracked} from '../../../../src';
// @ts-ignore
import {callback} from './trackers';

// @ts-ignore
class Foo {
  // @ts-ignore
  #bar = 'baz';

  @tracked(callback)
  public set bar({test}: any) {
    this.#bar = test;
  }
}
