'use strict';
/* eslint-disable no-console */
const chalk = require('chalk');
const path = require('path');
const secrets = require('../secrets');


// This and anything in config.paths must be absolute.
const ROOT_PATH = path.resolve(__dirname, '../..');

const SOURCE_DIRNAME = 'src';
const WEB_ROOT_DIRNAME = 'public';
const ASSETS_DIRNAME = 'static';
const BUILD_DIRNAME = 'static/build';

const ACME_CHALLENGE_DIRNAME = secrets.sslACMEChallengeDir;

const SERVER_HOST = secrets.domain;
const SERVER_BARE_HOST = secrets.bareDomain;
const SERVER_PROTOCOL = secrets.protocol;
const SERVER_HTTPS_PORT = secrets.port.https;
const SERVER_HTTP_PORT = secrets.port.http;

const DEV_SERVER_HOST = '0.0.0.0';
const DEV_SERVER_PROTOCOL = 'http';
const DEV_SERVER_PORT = 3000;
const WEBPACK_DEV_SERVER_PORT = 3001;


const config = {
  publicPaths: {
    assets: '/' + ASSETS_DIRNAME + '/',
    build: '/' + BUILD_DIRNAME + '/',
    acmeChallenge: '/' + ACME_CHALLENGE_DIRNAME + '/'
  },
  paths: {
    root: ROOT_PATH,
    webRoot: path.join(ROOT_PATH, WEB_ROOT_DIRNAME),
    assets: path.join(ROOT_PATH, WEB_ROOT_DIRNAME, ASSETS_DIRNAME),
    build: path.join(ROOT_PATH, WEB_ROOT_DIRNAME, BUILD_DIRNAME), // Do not keep any non-generated files here.
    source: path.join(ROOT_PATH, SOURCE_DIRNAME),
    components: path.join(ROOT_PATH, SOURCE_DIRNAME, 'components'),
    serverViews: path.join(ROOT_PATH, SOURCE_DIRNAME, 'server/views'),
    acmeChallenge: path.join(ROOT_PATH, WEB_ROOT_DIRNAME, ACME_CHALLENGE_DIRNAME)
  },
  server: {
    publicFiles: [
      'robots.txt',
      'favicon.ico'
    ]
  },
  webpack: {
    // Webpack bundle filename for stylesheets
    stylesFilename: '[name]-[hash].css',
    // Assets-webpack-plugin generates a JSON file containing actual
    // webpack bundle filenames on every webpack emit event.
    // To get the actual bundle filenames, use config/webpack-assets.js
    assetsFilename: 'webpack-assets.json',
    assetsPath: ROOT_PATH
  },
  vision: {
    viewsPath: 'views'
  }
};


if (process.env.NODE_ENV === 'development') {
  Object.assign(config.server, {
    host: DEV_SERVER_HOST,
    httpPort: DEV_SERVER_PORT,
    protocol: DEV_SERVER_PROTOCOL,
    rootUrl: DEV_SERVER_PROTOCOL + '://' + DEV_SERVER_HOST + ':' + DEV_SERVER_PORT
  });
  Object.assign(config.webpack, {
    port: WEBPACK_DEV_SERVER_PORT,
    devServerUrl: DEV_SERVER_PROTOCOL + '://' + DEV_SERVER_HOST + ':' + WEBPACK_DEV_SERVER_PORT,
    // Webpack bundle filename
    outputFilename: '[name]-bundle-[hash].js'
  });
} else if (process.env.NODE_ENV === 'production') {
  Object.assign(config.server, {
    host: SERVER_HOST,
    bareHost: SERVER_BARE_HOST,
    httpsPort: SERVER_HTTPS_PORT,
    httpPort: SERVER_HTTP_PORT,
    protocol: SERVER_PROTOCOL,
    rootUrl: SERVER_PROTOCOL + '://' + SERVER_HOST
  });
  Object.assign(config.webpack, {
    // Webpack bundle filename
    outputFilename: '[name]-bundle-[contenthash].js'
  });
} else {
  const errorText = '[' + path.basename(__filename) + '] ERROR: NODE_ENV is not set: ' + process.env.NODE_ENV;
  console.log(chalk.red(errorText));
  throw new Error(errorText);
}


Object.freeze(config); // On a separate line because IntelliJ's JS code assistance is not very smart :(


module.exports = config;
