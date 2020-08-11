// @ts-ignore
class Foo {
  // @ts-ignore
  @getter(function (value: string): string {
    console.log(value);

    return value;
  })
  public bar?: string;
}
