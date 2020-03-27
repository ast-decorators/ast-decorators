import {getter} from '../../../../src';

const get = function (value: string): string {
  console.log(value);

  return value;
};

// @ts-ignore
class Foo {
  @getter(get)
  public bar?: string;
}
