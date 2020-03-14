import {foo} from '../decorators';
// @ts-ignore
import {bar} from './path/to/decorator';
// @ts-ignore
import {baz} from '../decorator.ignore';

@baz
@bar
@foo('bar', 'baz')
// @ts-ignore
class Foo {}
