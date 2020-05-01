const obj = {
  get(value: string): string {
    console.log(value);

    return value;
  },
};

// @ts-ignore
class Foo {
  // @ts-ignore
  @getter(obj.get)
  public bar?: string;
}
