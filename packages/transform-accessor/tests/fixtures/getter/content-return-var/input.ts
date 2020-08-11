import {getter} from '../../../../src';
// @ts-ignore
import {get} from './get';

// @ts-ignore
class Foo {
  @getter(get)
  public get bar(): object {
    const baz = {
      fuzz: 1,
    };

    return baz;
  }
}
