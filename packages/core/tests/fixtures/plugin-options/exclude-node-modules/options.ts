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
            /ignored-module-second(\/\w+)*\/somefile/,
            'ignored-module-third/**/*.decorator'
          ],
        },
      },
    ],
    [require('@babel/plugin-syntax-decorators'), {legacy: true}],
  ],
};
