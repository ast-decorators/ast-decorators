export default {
  comments: false,
  presets: [require('@babel/preset-typescript')],
  plugins: [
    [
      require('../../../../src'),
      {
        plugins: {
          'privacy-plugin': {privacy: 'hard'},
        },
      },
    ],
    [require('@babel/plugin-syntax-decorators'), {legacy: true}],
  ],
};
