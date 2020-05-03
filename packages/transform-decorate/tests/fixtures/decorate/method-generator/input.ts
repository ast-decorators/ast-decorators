// @ts-ignore
import {decorate} from '../../../../src';
// @ts-ignore
import {decorator} from './bar';

// @ts-ignore
class Foo {
  // @ts-ignore
  @decorate(decorator)
  public *bar(num: number) {
    return num * num;
  }
}
