const webpack = require('webpack');
const path = require('path');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');

const extractSass = new ExtractTextPlugin({
  filename: '[name].[chunkhash].css',
  disable: process.env.NODE_ENV === 'development'
});

const VENDOR_LIBS = [
  'babel-polyfill',
  'isomorphic-fetch',
  'lodash/debounce',
  'prop-types',
  'react',
  'react-dom',
  'react-redux',
  'react-router-dom',
  'redux',
  'redux-logger',
  'redux-responsive',
  'redux-thunk',
  'single-line-string'
];

module.exports = {
  entry: {
    bundle: './src/index.js',
    vendor: VENDOR_LIBS
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.geojson']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'eslint-loader'
          }
        ]
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
  devServer: {
    compress: true,
    historyApiFallback: true,
    port: 8888
  },
  plugins: [
    extractSass,
    new StyleLintPlugin({
      configFile: '.stylelintrc.json',
      files: '**/*.scss',
      failOnError: false,
      quiet: false,
      syntax: 'scss'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
      minChunks: Infinity
    }),
    new HTMLWebpackPlugin({
      template: 'src/index.html'
    }),
    new WebpackNotifierPlugin({ alwaysNotify: true }),
  ]
};
