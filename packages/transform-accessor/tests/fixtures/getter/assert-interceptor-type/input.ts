import {getter} from '../../../../src';

// @ts-ignore
class Foo {
  // @ts-ignore
  @getter('wrong')
  public bar?: string;
}
