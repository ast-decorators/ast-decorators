export default {
  comments: false,
  presets: [require('@babel/preset-typescript')],
  plugins: [
    [
      require('@ast-decorators/core'),
      {
        transformers: [
          [
            require('../../../../src/transformer'),
            {
              interceptorContext: {
                exclude: {
                  names: ['markedGetter'],
                },
              },
              transformerPath: '**/transform-accessor/src',
            },
          ],
        ],
      },
    ],
    [require('@babel/plugin-syntax-decorators'), {legacy: true}],
    require('@babel/plugin-syntax-class-properties'),
  ],
};
