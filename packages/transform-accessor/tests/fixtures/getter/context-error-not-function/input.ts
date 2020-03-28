import {getter} from '../../../../src';

const get = 20;

// @ts-ignore
class Foo {
  // @ts-ignore
  @getter(get)
  public bar?: string;
}
