module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      unitToConvert: 'px',
      viewportWidth: 1080,
      unitPrecision: 5,
      propList: ['*'],
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      selectorBlackList: [],
      minPixelValue: 1,
      mediaQuery: false,
      replace: true,
      exclude: [],
      landscape: false,
      landscapeUnit: 'px',
      landscapeWidth: 568,
    },
    // 'postcss-pxtorem': {
    //   rootValue: 108,
    //   propList: ['*'],
    // },
    // 'postcss-pxtocssvar': {},
  },
}
