export default {
  comments: false,
  presets: [require('@babel/preset-typescript')],
  plugins: [
    [
      require('../../../../src'),
      {
        exclude: {
          names: ['bar']
        }
      },
    ],
    [require('@babel/plugin-syntax-decorators'), {legacy: true}],
  ],
};
