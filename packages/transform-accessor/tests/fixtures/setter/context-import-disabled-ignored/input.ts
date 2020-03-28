import {setter} from '../../../../src';
// @ts-ignore
import {markedSetter} from './set'

// @ts-ignore
class Foo {
  @setter(markedSetter)
  public bar?: string;
}
