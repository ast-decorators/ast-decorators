import {tracked} from '../../../../src';

// @ts-ignore
class Foo {
  @tracked((value: string) => {
    console.log(value);

    return value;
  })
  public bar?: string;
}
