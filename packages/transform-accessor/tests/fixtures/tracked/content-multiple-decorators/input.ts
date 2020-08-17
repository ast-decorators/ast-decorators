import {tracked} from '../../../../src';
// @ts-ignore
import {callback1, callback2, callback3} from './trackers';

// @ts-ignore
class Foo {
  @tracked(callback3)
  @tracked(callback2)
  @tracked(callback1)
  public bar?: string;
}
