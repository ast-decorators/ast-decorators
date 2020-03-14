import {foo} from '../decorators';
// @ts-ignore
import {bar} from 'ignored-module/path/to/file';
// @ts-ignore
import {baz} from 'ignored-module';
// @ts-ignore
import {fuzz} from 'ignored-module-second/path/to/dir/somefile';
// @ts-ignore
import {buzz} from 'ignored-module-third/path/to/file.decorator';

@buzz
@fuzz
@baz
@bar
@foo('bar', 'baz')
// @ts-ignore
class Foo {}
