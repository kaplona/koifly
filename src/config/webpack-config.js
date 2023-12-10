'use strict';

const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge'); // concatenates arrays for the same key instead of replacing the first array
const AssetsWebpackPlugin = require('assets-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const config = require('./variables');

const APP_ENTRY = path.join(config.paths.source, 'main-app');
const HOME_ENTRY = path.join(config.paths.components, 'home-page/home');
const WEBPACK_HOT_ENTRY = 'webpack-hot-middleware/client?path=' + config.webpack.devServerUrl + '/__webpack_hmr';
const REACT_HOT_ENTRY = 'react-hot-loader/patch';


let webpackConfig = {
  mode: 'none',
  entry: {
    app: APP_ENTRY,
    home: HOME_ENTRY
  },
  resolve: {
    // Webpack tries appending these extensions when you import your modules
    extensions: ['.js', '.jsx']
  },
  output: {
    publicPath: config.publicPaths.build, // Expose bundles in this web directory (Note: only dev server uses this option)
    filename: config.webpack.outputFilename, // Bundle filename pattern
    path: config.paths.build // Put bundle files in this directory (Note: dev server does not generate bundle files)
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        include: config.paths.source,
        // loaders are processed from the bottom up
        use: [
          // Use MiniCssExtractPlugin.loader instead of "style-loader"
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: config.paths.assets,
            }
          },
          {
            loader: 'css-loader',
            options: {
              url: false, // This is the key change
            },
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                strictMath: true,
              }
            }
          }
        ]
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        include: config.paths.source
      }
    ]
  },
  optimization: {
    // Extracting webpack runtime and manifest into separate bundle,
    // so that code is not included in the main bundle and content hashes in generated file names work as expected.
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'BROWSER': JSON.stringify(true) // is used for testing to prevent import css modules into testing env
      }
    }),
    new AssetsWebpackPlugin({
      filename: config.webpack.assetsFilename,
      path: config.webpack.assetsPath,
      prettyPrint: true
    }),
    new MiniCssExtractPlugin({
      filename: config.webpack.stylesFilename
    })
  ]
};


if (process.env.NODE_ENV === 'development') {
  webpackConfig = merge(webpackConfig, {
    mode: 'development',
    entry: {
      app: [WEBPACK_HOT_ENTRY, REACT_HOT_ENTRY, APP_ENTRY],
      sandbox: [WEBPACK_HOT_ENTRY, REACT_HOT_ENTRY, path.join(config.paths.source, 'main-sandbox')]
    },
    devtool: 'eval-cheap-module-source-map', // Generate source maps (more or less efficiently)
    plugins: [
      new webpack.HotModuleReplacementPlugin(), // Enables HMR.
      new ESLintPlugin({
        extensions: ['js', 'jsx'],
        files: config.paths.source,
      })
    ]
  });
} else if (process.env.NODE_ENV === 'production') {
  /** @lends webpackConfig */
  webpackConfig = merge(webpackConfig, {
    mode: 'production',
    devtool: 'nosources-source-map', // generate full source maps
    optimization: {
      // Setting minimizer for css overrides the defaults provided by webpack,
      // so we have to also specify a JS minimizer.
      minimize: true,
      minimizer: [new TerserPlugin({ sourceMap: true }), new CssMinimizerPlugin({})]
    },
  });
}


module.exports = webpackConfig;
