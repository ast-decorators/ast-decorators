import {wrap} from '../../../../src';
// @ts-ignore
import {wrapper} from './wrapper';

// @ts-ignore
class Foo {
  @wrap(wrapper, 'foo', 'bar', 42)
  public bar(num: number) {
    return num * num;
  }
}
