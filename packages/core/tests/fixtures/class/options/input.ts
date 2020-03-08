import {foo} from './decorators';

@foo('bar', 'baz')
// @ts-ignore
class Link extends HTMLAnchorElement {}
