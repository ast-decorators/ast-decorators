import {wrap} from '../../../../src';
// @ts-ignore
import {dec1} from './dec1';
// @ts-ignore
import {dec2} from './dec2';

// @ts-ignore
class Foo {
  @wrap(dec2)
  @wrap(dec1)
  public bar(num: number) {
    return num * num;
  }
}
