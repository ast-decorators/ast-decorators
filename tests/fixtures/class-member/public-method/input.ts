import bind from './decorator';

// @ts-ignore
class Foo {
  @bind bar() {};
}
