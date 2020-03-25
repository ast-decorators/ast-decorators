export default {
  comments: false,
  presets: [require('@babel/preset-typescript')],
  plugins: [
    [
      require('../../../../src'),
      {
        transformers: [[require('./transformer'), {privacy: 'hard'}]],
      },
    ],
    [require('@babel/plugin-syntax-decorators'), {legacy: true}],
    require('@babel/plugin-syntax-class-properties'),
  ],
};
