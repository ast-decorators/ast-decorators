import {setter} from '../../../../src';
// @ts-ignore
import {set1, set2, set3} from './sets';

// @ts-ignore
class Foo {
  @setter(set3)
  @setter(set2)
  @setter(set1)
  public bar?: string;
}
