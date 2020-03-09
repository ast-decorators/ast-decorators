import * as decorators from './decorators';

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
