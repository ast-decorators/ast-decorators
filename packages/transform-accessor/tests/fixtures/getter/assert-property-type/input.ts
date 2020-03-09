import {getter} from '../../../../src';

// @ts-ignore
class Foo {
  @getter()
  public method(): void {}
}
