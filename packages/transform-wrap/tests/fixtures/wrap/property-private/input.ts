// @ts-ignore
import {wrap} from '../../../../src';
// @ts-ignore
import {wrapper} from './wrapper';

// @ts-ignore
class Foo {
  // @ts-ignore
  @wrap(wrapper)
  // @ts-ignore
  #bar = (num: number) => {
    return num * num;
  }
}
