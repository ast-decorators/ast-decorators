import {setter} from '../../../../src';

const set = (value: string): string => {
  console.log(value);

  return value;
};

// @ts-ignore
class Foo {
  @setter(set)
  public bar?: string;
}
