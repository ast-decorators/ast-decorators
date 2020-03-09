import {element} from './decorators';

@element('x-test', {extends: 'a'})
// @ts-ignore
class Link extends HTMLAnchorElement {}
