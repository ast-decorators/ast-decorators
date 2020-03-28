// @ts-ignore
import {getter} from '../../../../src';

// @ts-ignore
const Foo = class {
  // @ts-ignore
  @getter()
  public static bar?: string;
};
