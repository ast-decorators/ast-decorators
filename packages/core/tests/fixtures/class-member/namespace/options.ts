const {resolve} = require('path');

module.exports = {
  comments: false,
  presets: [require('@babel/preset-typescript')],
  plugins: [
    [require('@babel/plugin-transform-modules-commonjs')],
    require(resolve(__dirname, '../../../../src')),
    [require('@babel/plugin-syntax-decorators'), {decoratorsBeforeExport: true}],
  ],
};
