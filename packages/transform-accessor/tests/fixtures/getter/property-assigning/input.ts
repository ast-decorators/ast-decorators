import {getter} from '../../../../src';

// @ts-ignore
class Foo {
  @getter() bar: string = 'baz';
}
