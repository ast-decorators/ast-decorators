// @ts-ignore
import decorate from './decorator';
// @ts-ignore
import {fn} from './utils';

// @ts-ignore
class Foo {
  @decorate(fn)
  bar() {}
}
