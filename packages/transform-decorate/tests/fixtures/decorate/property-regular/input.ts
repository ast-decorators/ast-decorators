import {decorate} from '../../../../src';
// @ts-ignore
import {decorator} from './decorator';

// @ts-ignore
class Foo {
  @decorate(decorator)
  public bar = function (num: number): number {
    return num * num;
  };
}
