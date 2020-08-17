// @ts-ignore
import {other} from 'decorators';
// @ts-ignore
import {get, set} from './interceptors';
import {accessor, tracked} from '../../../../src';

// @ts-ignore
class Foo {
  @other @accessor(get, set) @tracked() public bar?: string;
}
