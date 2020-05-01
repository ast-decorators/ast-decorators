const bar = Symbol('bar');

class Foo {
  [bar]?: string;
}
