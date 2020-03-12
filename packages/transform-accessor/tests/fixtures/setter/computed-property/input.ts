import {setter} from '../../../../src';

const $bar = Symbol();

// @ts-ignore
class Foo {
  @setter() public [$bar]?: string;
}
