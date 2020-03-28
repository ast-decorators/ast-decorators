import {accessor} from '../../../../src';

// @ts-ignore
class Foo {
  @accessor()
  public static bar?: string;
}
