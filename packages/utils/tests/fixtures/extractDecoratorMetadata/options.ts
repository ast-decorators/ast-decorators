export default {
  comments: false,
  plugins: [
    require('@babel/plugin-syntax-typescript'),
    [require('@babel/plugin-syntax-decorators'), {legacy: true}],
    require('@babel/plugin-syntax-class-properties'),
  ],
};
