import {wrap} from '../../../../src';
// @ts-ignore
import {wrapper} from './wrapper';

// @ts-ignore
class Foo {
  @wrap(wrapper)
  public bar = function (num: number): number {
    return num * num;
  };
}
