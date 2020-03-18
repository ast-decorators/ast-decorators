export default {
  comments: false,
  presets: [require('@babel/preset-typescript')],
  plugins: [
    require('@ast-decorators/core'),
    [require('@babel/plugin-syntax-decorators'), {legacy: true}],
    require('@babel/plugin-syntax-class-properties'),
  ],
};
