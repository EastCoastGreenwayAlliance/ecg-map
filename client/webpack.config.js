/* eslint-disable func-names, object-shorthand */
const webpack = require('webpack');
const path = require('path');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');

const extractSass = new ExtractTextPlugin({
  filename: '[name].[hash].css',
  disable: process.env.NODE_ENV === 'development'
});

module.exports = {
  entry: {
    bundle: ['react-hot-loader/patch', './src/index.js']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].js',
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
        use: [
          {
            loader: 'style-loader' // creates style nodes from JS strings
          },
          {
            loader: 'css-loader' // translates CSS into CommonJS
          },
          {
            loader: 'sass-loader' // compiles Sass to CSS
          }
        ]
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
    hotOnly: true, // tell dev-server we're using HMR
    port: 8888,
    proxy: {
      '/signup*': 'http://127.0.0.1:5001'
    }
  },
  plugins: [
    // use Sass
    extractSass,

    // lint Sass
    new StyleLintPlugin({
      configFile: '.stylelintrc.json',
      files: '**/*.scss',
      failOnError: false,
      quiet: false,
      syntax: 'scss'
    }),

    // make our NODE_ENV available
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),

    // enable HMR globally
    new webpack.HotModuleReplacementPlugin(),

    // print more readable module names in the browser console on HMR updates
    new webpack.NamedModulesPlugin(),

    // use our index.html file
    new HTMLWebpackPlugin({
      template: 'src/index.html'
    }),

    // notifications on updates
    new WebpackNotifierPlugin({ alwaysNotify: true }),

    // codesplitting output files
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        // this assumes your vendor imports exist in the node_modules directory
        return module.context && module.context.indexOf('node_modules') !== -1;
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
  ]
};
