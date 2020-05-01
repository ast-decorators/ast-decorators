import {decorate} from '../../../../src';
// @ts-ignore
import {decorator} from './decorator';

// @ts-ignore
class Foo {
  @decorate(decorator, 'foo', 'bar', 42)
  public bar(num: number) {
    return num * num;
  }
}
