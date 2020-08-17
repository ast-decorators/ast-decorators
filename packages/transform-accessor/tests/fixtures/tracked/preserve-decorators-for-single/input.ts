// @ts-ignore
import {other} from 'decorators';
import {tracked} from '../../../../src';

// @ts-ignore
class Foo {
  @other() @tracked() public bar?: string;
}
