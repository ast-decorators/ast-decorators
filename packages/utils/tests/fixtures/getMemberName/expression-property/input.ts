const a = true;

class Foo {
  // @ts-ignore
  [a ? 'foo' : 'bar']?: string;
}
