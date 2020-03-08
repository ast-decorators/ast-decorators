import * as decorators from './decorator';

// @ts-ignore
class Foo {
  @decorators.foo
  @decorators.bar
  public baz: number = 100;
}

// @ts-ignore
class Bar {
  @decorators.bar
  @decorators.foo
  public baz: number = 10;
}
