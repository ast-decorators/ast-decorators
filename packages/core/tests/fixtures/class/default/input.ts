import element from './decorator';

@element('x-test', {extends: 'a'})
// @ts-ignore
class Link extends HTMLAnchorElement {}
