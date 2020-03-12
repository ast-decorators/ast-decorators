import {setter} from '../../../../src';

// @ts-ignore
class Foo {
  @setter() bar: string = 'baz';
}
