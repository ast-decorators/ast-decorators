import {getter} from '../../../../src';

const $bar = Symbol();

// @ts-ignore
class Foo {
  @getter() public [$bar]?: string;
}
