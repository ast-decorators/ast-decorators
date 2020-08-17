import {tracked} from '../../../../src';

// @ts-ignore
class Foo {
  @tracked()
  public static bar?: string;
}
