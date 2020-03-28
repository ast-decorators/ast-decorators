import {getter} from '../../../../src';

// @ts-ignore
class Foo {
  @getter()
  public static bar?: string;
}
