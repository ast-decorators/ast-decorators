import {foo} from './decorators';

@foo('bar')
// @ts-ignore
class Link extends HTMLAnchorElement {}
