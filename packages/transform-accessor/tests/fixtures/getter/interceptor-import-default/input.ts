import {getter} from '../../../../src';
// @ts-ignore
import {get} from './get'

// @ts-ignore
class Foo {
  @getter(get)
  public bar?: string;
}
