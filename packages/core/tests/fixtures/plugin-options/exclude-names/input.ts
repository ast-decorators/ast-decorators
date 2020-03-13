import {foo} from '../decorators';
// @ts-ignore
import {bar} from './other';
// @ts-ignore
import {$bar, $baz} from './other-two';
// @ts-ignore
import {$fuzz} from './fuzz';

@$bar
@$baz
@$fuzz
@bar
@foo('bar', 'baz')
// @ts-ignore
class Foo {}
