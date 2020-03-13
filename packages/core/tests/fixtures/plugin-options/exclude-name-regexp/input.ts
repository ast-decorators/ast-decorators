import {foo} from '../decorators';
// @ts-ignore
import {$bar, $baz} from './other';
// @ts-ignore
import {$fuzz} from './fuzz';

@$bar
@$baz
@$fuzz
@foo('bar', 'baz')
// @ts-ignore
class Foo {}
