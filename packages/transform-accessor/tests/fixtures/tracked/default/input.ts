import {tracked} from '../../../../src';

// @ts-ignore
class Foo {
  @tracked()
  public bar?: string;
}
