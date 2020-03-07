const {resolve} = require('path');
const cwd = process.cwd();

module.exports = {
  comments: false,
  presets: [require('@babel/preset-typescript')],
  plugins: [
    [require('@babel/plugin-transform-modules-commonjs')],
    require(resolve(cwd, 'src')),
    [require('@babel/plugin-syntax-decorators'), {legacy: true}],
  ],
};
