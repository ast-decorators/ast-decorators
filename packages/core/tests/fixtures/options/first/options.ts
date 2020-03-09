export default {
  comments: false,
  presets: [require('@babel/preset-typescript')],
  plugins: [
    [require('@babel/plugin-transform-modules-commonjs')],
    [require('../../../../src'), {privacy: 'hard'}],
    [require('@babel/plugin-syntax-decorators'), {legacy: true}],
  ],
};