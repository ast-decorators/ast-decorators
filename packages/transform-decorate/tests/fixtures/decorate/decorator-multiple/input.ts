import {decorate} from '../../../../src';
// @ts-ignore
import {dec1} from './dec1';
// @ts-ignore
import {dec2} from './dec2';

// @ts-ignore
class Foo {
  @decorate(dec2)
  @decorate(dec1)
  public bar(num: number) {
    return num * num;
  }
}
