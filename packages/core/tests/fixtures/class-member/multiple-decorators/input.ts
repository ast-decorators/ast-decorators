import {foo, bar} from './decorators';

// @ts-ignore
class Foo {
  @foo
  @bar
  public baz: number = 100;
}

// @ts-ignore
class Bar {
  @bar
  @foo
  public baz: number = 10;
}
