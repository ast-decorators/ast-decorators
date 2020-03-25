import {bar as b, foo as f} from '../decorators';

@f()
@b
// @ts-ignore
class Link extends HTMLAnchorElement {}
