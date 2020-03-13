export default {
  comments: false,
  presets: [require('@babel/preset-typescript')],
  plugins: [
    [
      require('../../../../src'),
      {
        exclude: {
          nodeModules: [
            'ignored-module',
            /other-ignored-module(\/\w+)*\/somefile/,
          ],
        },
      },
    ],
    [require('@babel/plugin-syntax-decorators'), {legacy: true}],
  ],
};
