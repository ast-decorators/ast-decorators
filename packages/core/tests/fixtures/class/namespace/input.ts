import * as decorators from '../decorators';

@decorators.foo()
@decorators.bar
// @ts-ignore
class Link extends HTMLAnchorElement {}
