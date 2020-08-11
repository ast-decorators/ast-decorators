// @ts-ignore
import {get} from './get';

// @ts-ignore
class Foo {
  // @ts-ignore
  @getter(get)
  public bar?: string;
}
