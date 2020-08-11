import {getter} from '../../../../src';
// @ts-ignore
import {get1, get2, get3} from './gets';

// @ts-ignore
class Foo {
  @getter(get3)
  @getter(get2)
  @getter(get1)
  public bar?: string;
}
