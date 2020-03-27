import {setter} from '../../../../src';

const set = 20;

// @ts-ignore
class Foo {
  // @ts-ignore
  @setter(set)
  public bar?: string;
}
