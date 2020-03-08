import {setter} from '../../../../src';

// @ts-ignore
class Foo {
  @setter()
  public bar?: string;
}
