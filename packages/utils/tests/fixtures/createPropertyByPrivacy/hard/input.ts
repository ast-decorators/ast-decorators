import foo from '../decorators';

// @ts-ignore
class Foo {
  @foo public bar?: string;
}
