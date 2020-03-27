import {setter} from '../../../../src';

// @ts-ignore
class Foo {
  // @ts-ignore
  @setter(set)
  public bar?: string;
}
