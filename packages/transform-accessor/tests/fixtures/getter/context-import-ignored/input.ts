import {getter} from '../../../../src';
// @ts-ignore
import {markedGetter} from './get'

// @ts-ignore
class Foo {
  @getter(markedGetter)
  public bar?: string;
}
