import {setter} from '../../../../src';

// @ts-ignore
class Foo {
  @setter()
  public static bar?: string;
}
