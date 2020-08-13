// @ts-ignore
import decorate from './decorator';
// @ts-ignore
import {_someUniqueVar} from './utils';

// @ts-ignore
class Foo {
  baz = _someUniqueVar;

  @decorate(() => {})
  bar() {}
}
