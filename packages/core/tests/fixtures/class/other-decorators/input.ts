// @ts-ignore
import anotherDecorator from 'other-decorators';
import {bar, foo} from '../decorators';

@anotherDecorator
@foo()
@bar
// @ts-ignore
class Link extends HTMLAnchorElement {}
