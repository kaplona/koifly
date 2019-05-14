'use strict';

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge'); // concatenates arrays for the same key instead of replacing the first array
const AssetsWebpackPlugin = require('assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const SlowWebpackPlugin = require('../tools/slow-webpack-plugin');
const config = require('./variables');

const APP_ENTRY = path.join(config.paths.source, 'main-app');
const HOME_ENTRY = path.join(config.paths.components, 'home-page/home');
const WEBPACK_HOT_ENTRY = 'webpack-hot-middleware/client?path=' + config.webpack.devServerUrl + '/__webpack_hmr';
const JS_JSX = /\.(js|jsx)$/;
const BABEL = 'babel'; // Transpile ES6/JSX into ES5


let webpackConfig = {
    entry: {
        app: APP_ENTRY,
        home: HOME_ENTRY
    },
    resolve: {
        // Webpack tries appending these extensions when you require(moduleName)
        // The empty extension allows specifying the extension in a require call, e.g. require('./main-app.less')
        extensions: ['', '.js', '.jsx']
    },
    output: {
        publicPath: config.publicPaths.build, // Expose bundles in this web directory (Note: only dev server uses this option)
        filename: config.webpack.outputFilename, // Bundle filename pattern
        path: config.paths.build  // Put bundle files in this directory (Note: dev server does not generate bundle files)
    },
    module: {
        loaders: [
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style', 'css!less'), // Loaders are processed last-to-first
                include: config.paths.source
            }
        ]
    },
    plugins: [
        // new SlowWebpackPlugin({delay: 2000}),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                'BROWSER': JSON.stringify(true)
            }
        }),
        new AssetsWebpackPlugin({
            filename: config.webpack.assetsFilename,
            path: config.webpack.assetsPath,
            prettyPrint: true
        }),
        new ExtractTextPlugin(config.webpack.stylesFilename)
    ]
};


if (process.env.NODE_ENV === 'development') {

    webpackConfig = webpackMerge(webpackConfig, {
        entry: {
            app: [APP_ENTRY, WEBPACK_HOT_ENTRY],
            sandbox: [path.join(config.paths.source, 'main-sandbox'), WEBPACK_HOT_ENTRY]
        },
        devtool: 'cheap-module-eval-source-map', // Generate source maps (more or less efficiently)
        module: {
            preLoaders: [
                {
                    test: JS_JSX,
                    loader: 'eslint-loader', // Lint all JS files before compiling the bundles (see .eslintrc for rules)
                    include: config.paths.source
                }
            ],
            loaders: [
                {
                    test: JS_JSX,
                    loader: BABEL,
                    include: config.paths.source,
                    query: {
                        plugins: [ [
                            'react-transform',
                            {
                                'transforms': [ {
                                    'transform': 'react-transform-hmr',
                                    'imports': [ 'react' ],
                                    'locals': [ 'module' ]
                                } ]
                            }
                        ] ]
                    }
                }
            ]
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(), // Enables HMR. Adds webpack/hot/dev-server entry point if hot=true
            new webpack.NoErrorsPlugin() // @TODO do we really want / need this? On dev or on production too?
        ],
        eslint: {
            // failOnWarning: true,
            failOnError: true
        }
    });

} else if (process.env.NODE_ENV === 'production') {

    /** @lends webpackConfig */
    webpackConfig = webpackMerge(webpackConfig, {
        devtool: 'source-map', // generate full source maps
        module: {
            loaders: [
                {
                    test: JS_JSX,
                    loader: BABEL,
                    include: config.paths.source
                }
            ]
        },
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compressor: {
                    warnings: false // Don't complain about things like removing unreachable code
                }
            })
        ]
    });
}


module.exports = webpackConfig;
