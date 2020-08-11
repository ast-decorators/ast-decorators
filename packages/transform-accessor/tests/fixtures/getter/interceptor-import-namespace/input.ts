import {getter} from '../../../../src';
// @ts-ignore
import * as getters from './get';

// @ts-ignore
class Foo {
  @getter(getters.get)
  public bar?: string;
}
