// @ts-ignore
import {bar, Fuzz} from 'decorators';

// @ts-ignore
class Foo extends Fuzz {
  @bar public baz?: string;
}
