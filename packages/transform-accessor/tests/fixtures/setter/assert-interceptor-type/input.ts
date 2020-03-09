import {setter} from '../../../../src';

// @ts-ignore
class Foo {
  // @ts-ignore
  @setter('wrong')
  public bar?: string;
}
