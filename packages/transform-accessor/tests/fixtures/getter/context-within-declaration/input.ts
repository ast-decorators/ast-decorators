import {getter} from '../../../../src';

function get(value: string): string {
  console.log(value);

  return value;
}

// @ts-ignore
class Foo {
  @getter(get)
  public bar?: string;
}