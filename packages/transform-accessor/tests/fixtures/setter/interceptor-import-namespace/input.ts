import {setter} from '../../../../src';
// @ts-ignore
import * as setters from './set';

// @ts-ignore
class Foo {
  @setter(setters.set)
  public bar?: string;
}
