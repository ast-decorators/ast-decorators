import {accessor} from '../../../../src';
// @ts-ignore
import {get1, get2, get3} from './getters';
// @ts-ignore
import {set1, set2, set3} from './setters';

// @ts-ignore
class Foo {
  @accessor(get3, set3)
  @accessor(get2, set2)
  @accessor(get1, set1)
  public bar?: string;
}
