// @ts-ignore
import {other} from 'decorators';
import {accessor} from '../../../../src';

// @ts-ignore
class Foo {
  @other() @accessor() public bar?: string;
}
