const path = require('path');
const React = require('react');
const ReactDOM = require('react-dom');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const PORT = 9000;

const DEFAULT_CONFIG = {
  entry: './src/entry.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  }
};

const DEV_CONFIG = {
  devtool: 'source-map',
  stats: 'errors-only',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'awesome-typescript-loader',
        include: [path.resolve(__dirname, 'src')]
      }, {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      }, {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader'
          }, {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          }, {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }, {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          'file-loader', {
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'assets/index.html')
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    compress: true,
    port: PORT,
    historyApiFallback: true,
    hot: true,
    progress: true,
    //lazy: true
  }
};

// TODO: Сделать продакш-конфиг
const PROD_CONFIG = {

};

module.exports = (env) => {
  switch (env) {
    case 'production':
      return Object.assign({}, DEFAULT_CONFIG, PROD_CONFIG);
    default:
      return Object.assign({}, DEFAULT_CONFIG, DEV_CONFIG);
  }
};
