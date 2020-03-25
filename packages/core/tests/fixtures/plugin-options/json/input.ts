import {foo} from '../decorators';
import {bar} from './decorators';

@bar
@foo('bar', 'baz')
// @ts-ignore
class Link extends HTMLAnchorElement {}
