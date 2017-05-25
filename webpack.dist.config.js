const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const extractSass = new ExtractTextPlugin({
  filename: '[name].[chunkhash].css',
  disable: process.env.NODE_ENV === 'development'
});

const VENDOR_LIBS = [
  'babel-polyfill',
  'react',
  'react-dom',
  'prop-types',
  'leaflet',
  'lodash/debounce'
];

module.exports = {
  entry: {
    bundle: './src/index.js',
    vendor: VENDOR_LIBS
  },
  cache: false,
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.geojson']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'sass-loader'
            }
          ],
          fallback: [{
            loader: 'style-loader'
          }]
        })
      },
      {
        test: /\.(json|geojson)$/,
        use: 'json-loader'
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        loader: 'file-loader?emitFile=false&name=[path][name].[ext]'
      }
    ]
  },
  plugins: [
    new UglifyJSPlugin({
      test: /\.(js|jsx)$/,
      mangle: false,
      sourceMap: true,
      compress: {
        dead_code: true,
        warnings: false, // Suppress uglification warnings
        screw_ie8: true,
      },
      exclude: [/\.min\.js$/gi] // skip pre-minified libs && css
    }),
    extractSass,
    new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new HTMLWebpackPlugin({
      template: 'src/index.html'
    }),
    // tell Webpack to copy static assets (images, icons, etc.) to dist/
    new CopyWebpackPlugin([{ from: 'assets/', to: 'assets/' }])
  ]
};
