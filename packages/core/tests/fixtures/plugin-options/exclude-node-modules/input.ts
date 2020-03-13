import {foo} from '../decorators';
// @ts-ignore
import {bar} from 'ignored-module/path/to/file';
// @ts-ignore
import {baz} from 'ignored-module';
// @ts-ignore
import {fuzz} from 'other-ignored-module/path/to/dir/somefile';

@fuzz
@baz
@bar
@foo('bar', 'baz')
// @ts-ignore
class Foo {}
