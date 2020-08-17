import {tracked} from '../../../../src';
// @ts-ignore
import {get} from './get';

// @ts-ignore
class Foo {
  @tracked(get)
  public bar?: string;
}
