var webpack = require('webpack');
var CleanPlugin = require('clean-webpack-plugin');
var ExtractPlugin = require('extract-text-webpack-plugin');
var production = process.env.NODE_ENV === 'production';

var plugins = [
  new ExtractPlugin('bundle.css'), // <=== where should content be piped
  new webpack.optimize.CommonsChunkPlugin({
    name: 'main', // Move dependencies to our main file
    children: true, // Look for common dependencies in all children,
    minChunks: 2, // How many times a dependency must come up before being extracted
  }),
];

if (production) {
  plugins = plugins.concat([
    new CleanPlugin('builds'),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.MinChunkSizePlugin({
        minChunkSize: 51200, // ~50kb
    }),
    new webpack.optimize.UglifyJsPlugin({
      mangle:   true,
      compress: {
          warnings: false, // Suppress uglification warnings
      },
    }),
    new webpack.DefinePlugin({
      __SERVER__:      !production,
      __DEVELOPMENT__: !production,
      __DEVTOOLS__:    !production,
      'process.env':   {
          BABEL_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ]);
}

module.exports = {
  debug: !production,
  devtool: production ? false : 'eval',
  entry:  './src',
  output: {
    path: 'builds',
    filename: production ? '[name]-[hash].js' : 'bundle.js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: 'builds/'
  },
  plugins: plugins,
  module: {
    loaders: [
      {
        test: /\.js/,
        loader: 'babel',
        include: __dirname + '/src'
      },
      {
        test: /\.scss/,
        loader: ExtractPlugin.extract('style', 'css!sass')
      },
      {
        test: /.\html/,
        loader: 'html'
      }
    ]
  }
};