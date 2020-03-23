export default (options: object) => ({
  comments: false,
  presets: [require('@babel/preset-typescript')],
  plugins: [
    [require('../../../src'), options],
    [require('@babel/plugin-syntax-decorators'), {legacy: true}],
    require('@babel/plugin-syntax-class-properties'),
  ],
});
