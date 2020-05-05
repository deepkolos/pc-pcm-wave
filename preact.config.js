import path from 'path'
import pkg from './package.json'
import { DefinePlugin, ProvidePlugin } from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import WebpackAliasSyncPlugin from 'webpack-alias-sync-plugin'

const p = str => path.resolve(__dirname, str)

const module = cfg => {
  cfg.entry = './components/pcm-wave/index.js'

  cfg.devtool = 'source-map'
  cfg.mode = 'development'
  // cfg.mode = 'production'

  cfg.output = {
    path: p('./lib'),
    filename: 'pc-pcm-wave.js',
    libraryTarget: 'umd',
  }
  cfg.externals = ['preact/hooks', 'preact']
  cfg.optimization.usedExports = true
  cfg.plugins = [
    ...cfg.plugins.filter(i => i.constructor.name === 'ProgressPlugin'),
    new MiniCssExtractPlugin({
      filename: 'pc-pcm-wave.css',
      chunkFilename: 'pc-pcm-wave.css',
    }),
    new ProvidePlugin({
      h: ['preact', 'h'],
      Fragment: ['preact', 'Fragment'],
    }),
    new DefinePlugin({
      'process.env.VERSION': JSON.stringify(pkg.version),
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ]
  // console.log('TCL: cfg', cfg.plugins)
}

export default (config, env) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    mock: p('./mocks/'),
    lib: p('./src/libs/'),
    img: p('./src/images/'),
    util: p('./src/utils/'),
    srv: p('./src/services'),
    com: p('./src/components/'),
  }

  config.node.process = 'mock'
  config.node.Buffer = true
  env.isProd && (config.output.publicPath = '/pc-pcm-wave/')

  config.plugins.push(new WebpackAliasSyncPlugin())
  config.module.rules.push({
    test: /\.worker\.js$/,
    use: { loader: 'worker-loader', options: { inline: true } },
  })

  if (env.module) module(config)
}
