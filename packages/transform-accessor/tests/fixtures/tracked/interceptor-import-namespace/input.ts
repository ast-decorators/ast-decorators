import {tracked} from '../../../../src';
// @ts-ignore
import * as getters from './get';

// @ts-ignore
class Foo {
  @tracked(getters.get)
  public bar?: string;
}
