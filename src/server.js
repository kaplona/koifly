'use strict';
/* eslint-disable no-console */

// Perform babel transforms defined in .babelrc (ES6, JSX, etc.) on server-side code
// Note: the options in .babelrc are also used for client-side code
// because we use a babel-loader in webpack config
require('babel-register');

const config = require('./config/variables');
const fs = require('fs');
const Hapi = require('@hapi/hapi');
const HapiReactViews = require('hapi-react-views');
const Inert = require('@hapi/inert');
const path = require('path');
const secrets = require('./secrets');
const Vision = require('vision');
const Url = require('url');

const AuthCookie = require('@hapi/cookie');
const setAuthCookie = require('./server/helpers/set-auth-cookie');
const checkAuthCookie = require('./server/auth-handlers/check-auth-cookie');
const checkCsrfToken = require('./server/auth-handlers/check-csrf-token');

const changePasswordHandler = require('./server/handlers/change-password-handler');
const importFlightsHandler = require('./server/handlers/import-flights-handler');
const loginHandler = require('./server/handlers/login-handler');
const queryHandler = require('./server/handlers/query-handler');
const resendAuthTokenHandler = require('./server/handlers/resend-auth-token-handler');
const resetPasswordHandler = require('./server/handlers/reset-password-handler');
const sendAuthTokenHandler = require('./server/handlers/send-auth-token-handler');
const signupHandler = require('./server/handlers/signup-handler');
const verifyAuthToken = require('./server/helpers/verify-auth-token');


const start = async () => {

  // all connections
  const serverOptions = {
    host: config.server.host,
    port: config.server.httpPort
  };

  // https connection
  if (secrets.shouldUseSSL) {
    serverOptions.tls = {
      key: fs.readFileSync(secrets.sslKeyFileName, 'utf8'),
      cert: fs.readFileSync(secrets.sslCrtFileName, 'utf8')
      // ssl certificate chain (uncomment if your CA cert file doesn't include the full chain)
      // ca: [
      //     fs.readFileSync(secrets.sslIntermediateCrtFileName, 'utf8'),
      //     fs.readFileSync(secrets.sslRootCrtFileName, 'utf8')
      // ]
    };
  }


  const server = Hapi.server(serverOptions);


  const plugins = [
    Inert, // enables serving static files (file and directory handlers)
    Vision, // enables rendering views with custom engines (view handler)
    AuthCookie // cookie authentication scheme
  ];
  // Enable proxying requests to webpack dev server (proxy handler)
  if (process.env.NODE_ENV === 'development') {
    const H2o2 = require('@hapi/h2o2');
    plugins.push(H2o2);
  }

  await server.register(plugins);


  // Register cookie authentication scheme
  server.auth.strategy('session', 'cookie', {
    cookie: {
      name: 'koifly',
      password: secrets.cookiePassword,
      ttl: secrets.cookieLifeTime,
      // domain: null - the domain that cookie was created
      domain: process.env.NODE_ENV === 'development' ? null : config.server.host,
      path: '/',
      clearInvalid: true,
      isSecure: false, // cookie allows to be transmitted over insecure connection
      isHttpOnly: true, // auth cookie is unavailable to js
    },
    redirectTo: false,
    keepAlive: true, // reset expiry date every time
    validateFunc: checkAuthCookie
  });


  // Register csrf cookie
  server.state('csrf', {
    ttl: secrets.cookieLifeTime,
    // domain: null - the domain that cookie was created
    domain: process.env.NODE_ENV === 'development' ? null : config.server.host,
    path: '/',
    isSecure: false, // cookie allows to be transmitted over insecure connection
    isHttpOnly: false, // scrf cookie is available to js
    strictHeader: true, // don't allow violations of RFC 6265
    encoding: 'none',
    ignoreErrors: false, // if true – errors are ignored and treated as missing cookie TODO check incorrect csrf behaviour
    clearInvalid: false
  });


  // redirect bare-hostname to www-hostname, http to https
  if (secrets.shouldUseSSL) {
    server.ext({
      type: 'onRequest',
      method: (request, reply) => {
        const isBareHostname = (request.info.hostname === config.server.bareHost);
        const isHttp = (request.info.remotePort !== config.server.httpsPort); // TODO is it the right way to get request port ???

        if (isBareHostname || isHttp) {
          return reply.redirect(Url.format({
            protocol: config.server.protocol,
            hostname: !isBareHostname ? request.info.hostname : config.server.host,
            pathname: request.path,
            port: config.server.httpsPort
          }));
        }

        return reply.continue;
      }
    });
  }


  // Set up server side react views using Vision
  server.views({
    engines: { jsx: HapiReactViews },
    path: config.paths.serverViews
  });


  // Note: only one route will be used to fulfill a request.
  // In case of multiple routes matching the URL, the most "specific" route wins.
  // See http://hapijs.com/api#path-matching-order

  // Serve all files from the assets directory
  // Note: in production this also serves webpack bundles
  server.route({
    method: 'GET',
    path: config.publicPaths.assets + '{path*}',
    handler: {
      directory: {
        path: config.paths.assets,
        index: false,
        listing: false,
        showHidden: false
      }
    }
  });

  // Serve white-listed files from the webRoot directory
  config.server.publicFiles.forEach(filename => {
    server.route({
      method: 'GET',
      path: '/' + filename,
      handler: {
        file: {
          path: path.join(config.paths.webRoot, filename)
        }
      }
    });
  });

  // Serve ACME challenge file from this directory
  if (secrets.shouldConfirmACMEChallenge) {
    server.route({
      method: 'GET',
      path: config.publicPaths.acmeChallenge + '{path*}',
      handler: {
        directory: {
          path: config.paths.acmeChallenge,
          index: false,
          listing: false,
          showHidden: true
        }
      }
    });
  }

  // TODO 404 error page
  // Catch-all
  // server.route({
  //     method: 'GET',
  //     path: '/{path*}',
  //     handler: function (request) {
  //         return 'Hapi catch-all view for /' + encodeURIComponent(request.params.path);
  //     }
  // });

  // App
  server.route({
    method: 'GET',
    path: '/',
    options: {
      auth: {
        strategy: 'session',
        mode: 'try'
      }
    },
    handler: function(request, reply) {
      const isLoggedIn = request.auth.isAuthenticated;
      return reply.view('about', { isLoggedIn: isLoggedIn }); // about.jsx in ./views
    }
  });

  server.route({
    method: 'GET',
    path: '/{path*}',
    handler: {
      view: 'app' // app.jsx in ./views
    }
  });

  server.route({
    method: 'GET',
    path: '/api/data',
    options: {
      auth: 'session',
      pre: [ checkCsrfToken ]
    },
    handler: queryHandler
  });

  server.route({
    method: 'POST',
    path: '/api/data',
    options: {
      auth: 'session',
      pre: [ checkCsrfToken ]
    },
    handler: queryHandler
  });

  server.route({
    method: 'POST',
    path: '/api/import-flights',
    options: {
      auth: 'session',
      pre: [ checkCsrfToken ],
      payload: {
        maxBytes: 1048576 // 1MB
      }
    },
    handler: importFlightsHandler
  });

  server.route({
    method: 'POST',
    path: '/api/signup',
    handler: signupHandler
  });

  server.route({
    method: 'POST',
    path: '/api/login',
    handler: loginHandler
  });

  server.route({
    method: 'POST',
    path: '/api/logout',
    handler: function(request) {
      request.cookieAuth.clear();
      return JSON.stringify('success');
    }
  });

  server.route({
    method: 'POST',
    path: '/api/change-password',
    options: {
      auth: 'session',
      pre: [ checkCsrfToken ]
    },
    handler: changePasswordHandler
  });

  server.route({
    method: 'GET',
    path: '/email-verification/{pilotId}/{authToken}',
    handler: function(request, reply) {
      verifyAuthToken(request.params.pilotId, request.params.authToken)
        .then(user => {
          return setAuthCookie(request, user.id, user.password);
        })
        .then(() => {
          return reply.view('app'); // app.jsx in ./views
        })
        .catch(() => {
          return reply.redirect('/invalid-verification-link');
        });
    }
  });

  server.route({
    method: 'POST',
    path: '/api/resend-auth-token',
    options: {
      auth: 'session',
      pre: [ checkCsrfToken ]
    },
    handler: resendAuthTokenHandler
  });

  server.route({
    method: 'POST',
    path: '/api/one-time-login',
    handler: sendAuthTokenHandler
  });

  server.route({
    method: 'POST',
    path: '/api/initiate-reset-password',
    handler: sendAuthTokenHandler
  });

  server.route({
    method: 'POST',
    path: '/api/reset-password',
    handler: resetPasswordHandler
  });


  // Dev routes
  if (process.env.NODE_ENV === 'development') {
    // Proxy webpack assets requests to webpack-dev-server
    // Note: in development webpack bundles are served from memory, not filesystem
    server.route({
      method: 'GET',
      path: config.publicPaths.build + '{path*}', // this includes HMR patches, not just webpack bundle files
      handler: {
        proxy: {
          host: config.server.host,
          port: config.webpack.port,
          passThrough: true
        }
      }
    });

    // Note: We also make requests to Webpack Dev Server EventSource endpoint (typically /__webpack_hmr).
    // We don't need to proxy these requests because we configured webpack-hot-middleware
    // to request them directly from a webpack dev server URL in webpack-config.js

    // Enable a separate dev sandbox
    server.route({
      method: 'GET',
      path: '/sandbox',
      handler: {
        view: 'sandbox' // sandbox.jsx in ./views
      }
    });
  }


  await server.start();
  console.log('Hapi server is running on %s', server.info.uri);
};


process.on('unhandledRejection', (err) => {
  console.error(err);

  const failureExitCode = 1;
  process.exit(failureExitCode);
});


start();
