export default {
  comments: false,
  presets: [require('@babel/preset-typescript')],
  plugins: [
    [require('../plugin'), {privacy: 'soft'}],
    require('@babel/plugin-syntax-class-properties'),
  ],
};
