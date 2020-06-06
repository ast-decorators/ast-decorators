import {foo} from './decorators';

// @ts-ignore
class Foo {
  @foo()
  @foo(true)
  @foo(true)
  prop = () => {};
}
