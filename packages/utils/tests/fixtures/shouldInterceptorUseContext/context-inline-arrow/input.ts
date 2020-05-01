// @ts-ignore
class Foo {
  // @ts-ignore
  @getter((value: string) => {
    console.log(value);

    return value;
  })
  public bar?: string;
}
