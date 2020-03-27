import {getter} from '../../../../src';

// @ts-ignore
class Foo {
  // @ts-ignore
  @getter(get)
  public bar?: string;
}
