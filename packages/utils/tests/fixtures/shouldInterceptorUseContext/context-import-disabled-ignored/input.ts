// @ts-ignore
import {markedGetter} from './get'

// @ts-ignore
class Foo {
  // @ts-ignore
  @getter(markedGetter)
  public bar?: string;
}
