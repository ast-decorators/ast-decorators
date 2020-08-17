import {tracked} from '../../../../src';
// @ts-ignore
import {callback} from './trackers';

// @ts-ignore
class Foo {
  @tracked(callback)
  public bar?: string;
}
