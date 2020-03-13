import {foo} from '../decorators';
// @ts-ignore
import {bar} from './other';

@bar
@foo('bar', 'baz')
// @ts-ignore
class Foo {}
