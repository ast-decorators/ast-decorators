import {foo} from './decorators';

@foo(1, 2, [3, 4])
@foo('test')
@foo({bar: 'baz'})
// @ts-ignore
class Link extends HTMLAnchorElement {}
