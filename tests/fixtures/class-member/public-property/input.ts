import observe from './decorator';

// @ts-ignore
class Foo {
  @observe(function(this: Foo, value: number) {
    this.observed = value;
  })
  public bar?: number;

  // @ts-ignore
  private observed?: number;
}
