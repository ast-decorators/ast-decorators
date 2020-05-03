// @ts-ignore
import {decorate} from '../../../../src';
// @ts-ignore
import {decorator} from './decorator';

// @ts-ignore
class Foo {
  // @ts-ignore
  @decorate(decorator)
  // @ts-ignore
  #bar = (num: number) => {
    return num * num;
  }
}
