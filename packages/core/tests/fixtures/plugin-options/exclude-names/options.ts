export default {
  comments: false,
  presets: [require('@babel/preset-typescript')],
  plugins: [
    [
      require('../../../../src'),
      {
        exclude: {
          names: ['bar', /\$\w+/]
        }
      },
    ],
    [require('@babel/plugin-syntax-decorators'), {legacy: true}],
  ],
};
