// @ts-ignore
import {setter} from '../../../../src';

// @ts-ignore
const Foo = class {
  // @ts-ignore
  @setter()
  public static bar?: string;
};
