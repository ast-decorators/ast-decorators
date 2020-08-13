// @ts-ignore
import decorate from './decorator';

// @ts-ignore
class Foo {
  @decorate(function (baz: number) {
    return baz * 10;
  })
  bar() {}
}
