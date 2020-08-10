function foo(this: any) {
  let a = 10;

  const _this = this;

  a = 20;

  return [a, _this];
}
