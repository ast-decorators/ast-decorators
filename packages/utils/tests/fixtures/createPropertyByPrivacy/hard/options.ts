export default {
  comments: false,
  presets: [require('@babel/preset-typescript')],
  plugins: [
    [require('../plugin'), {privacy: 'hard'}],
    require('@babel/plugin-syntax-class-properties'),
  ],
};
