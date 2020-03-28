import {setter} from '../../../../src';
// @ts-ignore
import {set} from './set'

// @ts-ignore
class Foo {
  @setter(set)
  public bar?: string;
}
