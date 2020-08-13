// @ts-ignore
import decorate from './decorator';
// @ts-ignore
import * as utils from './utils';

// @ts-ignore
class Foo {
  @decorate(utils.fn)
  bar() {}
}
