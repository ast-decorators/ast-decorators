import {wrap} from '../../../../src';
// @ts-ignore
import {dec1} from './dec1';
// @ts-ignore
import {dec2} from './dec2';
// @ts-ignore
import {dec3} from './dec2';

// @ts-ignore
class Foo {
  @wrap(dec3, 3, 2, 1)
  @wrap(dec2, 2, 1)
  @wrap(dec1, 1)
  public bar(num: number) {
    return num * num;
  }
}
