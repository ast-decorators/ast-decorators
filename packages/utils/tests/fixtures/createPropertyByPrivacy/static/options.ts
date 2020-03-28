export default {
  comments: false,
  presets: [require('@babel/preset-typescript')],
  plugins: [
    [require('../plugin'), {static: true}],
    require('@babel/plugin-syntax-class-properties'),
  ],
};
