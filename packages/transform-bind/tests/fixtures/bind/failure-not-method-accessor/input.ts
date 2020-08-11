import {bind} from '../../../../src';

// @ts-ignore
class Foo {
  public a: string = '10';

  @bind
  public get bar(): string {
    return this.a;
  }
}
