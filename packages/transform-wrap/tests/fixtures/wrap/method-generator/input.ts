// @ts-ignore
import {wrap} from '../../../../src';
// @ts-ignore
import {wrapper} from './bar';

// @ts-ignore
class Foo {
  // @ts-ignore
  @wrap(wrapper)
  public *bar(num: number) {
    return num * num;
  }
}
