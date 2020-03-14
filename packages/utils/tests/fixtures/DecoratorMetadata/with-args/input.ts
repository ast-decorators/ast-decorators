// @ts-ignore
import {bar} from 'decorators';

// @ts-ignore
class Foo {
  @bar('fuzz') public baz?: string;
}
