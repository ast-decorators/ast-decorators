function get(value: string): string {
  console.log(value);

  return value;
}

// @ts-ignore
class Foo {
  // @ts-ignore
  @getter(get)
  public bar?: string;
}
