// @ts-ignore
import decorate from './decorator';

// @ts-ignore
class Foo {
  @decorate((baz: number) => baz * 10)
  bar() {}
}
