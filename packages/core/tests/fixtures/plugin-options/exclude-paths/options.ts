export default {
  comments: false,
  presets: [require('@babel/preset-typescript')],
  plugins: [
    [
      require('../../../../src'),
      {
        exclude: {
          paths: ['**/*.ignore', 'packages/**/*/exclude-paths/**/*'],
        },
      },
    ],
    [require('@babel/plugin-syntax-decorators'), {legacy: true}],
  ],
};
