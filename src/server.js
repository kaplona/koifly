'use strict';

// Perform babel transforms defined in .babelrc (ES6, JSX, etc.) on server-side code
// Note: the options in .babelrc are also used for client-side code
// because we use a babel loader in webpack config
require('babel-register');

var config = require('./config/variables');
var fs = require('fs');
var Hapi = require('hapi');
var HapiReactViews = require('hapi-react-views');
var Inert = require('inert');
var path = require('path');
var secrets = require('./secrets');
var Vision = require('vision');
var Url = require('url');

var AuthCookie = require('hapi-auth-cookie');
var setAuthCookie = require('./server/helpers/set-auth-cookie');
var checkAuthCookie = require('./server/auth/check-auth-cookie');
var checkCsrfToken = require('./server/auth/check-csrf-token');

var changePasswordHandler = require('./server/handlers/change-password-handler');
var loginHandler = require('./server/handlers/login-handler');
var queryHandler = require('./server/handlers/query-handler');
var resendAuthTokenHandler = require('./server/handlers/resend-auth-token-handler');
var resetPasswordHandler = require('./server/handlers/reset-password-handler');
var sendAuthTokenHandler = require('./server/handlers/send-auth-token-handler');
var signupHandler = require('./server/handlers/signup-handler');
var verifyAuthToken = require('./server/helpers/verify-auth-token');




var server = new Hapi.Server();


// http connection
server.connection({
    host: config.server.host,
    port: config.server.httpPort
});


// https connection
if (secrets.shouldUseSSL) {

    server.connection({
        host: config.server.host,
        port: config.server.httpsPort,
        tls: {
            key: fs.readFileSync(secrets.sslKeyFileName, 'utf8'),
            cert: fs.readFileSync(secrets.sslCrtFileName, 'utf8'),
            // ssl certificate chain
            ca: [
                fs.readFileSync(secrets.sslIntermediateCrtFileName, 'utf8'),
                fs.readFileSync(secrets.sslRootCrtFileName, 'utf8')
            ]
        }
    });

    server.ext('onRequest', (request, reply) => {

        // redirect bare-hostname to www-hostname
        if (request.info.hostname === config.server.bareHost) {

            reply.redirect(Url.format({
                protocol: config.server.protocol,
                hostname: config.server.host,
                pathname: request.url.path,
                port: config.server.httpsPort
            }));
            return;
        }

        // redirect http to https
        if (request.connection.info.port !== config.server.httpsPort) {

            reply.redirect(Url.format({
                protocol: config.server.protocol,
                hostname: request.info.hostname,
                pathname: request.url.path,
                port: config.server.httpsPort
            }));
            return;
        }

        reply.continue();
    });
}


var plugins = [
    { register: Inert }, // enables serving static files (file and directory handlers)
    { register: Vision }, // enables rendering views with custom engines (view handler)
    { register: AuthCookie } // cookie authentication scheme
];
// Enable proxying requests to webpack dev server (proxy handler)
if (process.env.NODE_ENV === 'development') {
    var H2o2 = require('h2o2');
    plugins.push({ register: H2o2 });
}



server.register(plugins, err => {

    if (err) {
        console.error(err);
        return;
    }

    // Register cookie authentication scheme
    server.auth.strategy('session', 'cookie', {
        cookie: 'koifly',
        // domain: null - the domain that cookie was created
        domain: process.env.NODE_ENV === 'development' ? null : config.server.host,
        path: '/',
        password: secrets.cookiePassword,
        ttl: secrets.cookieLifeTime,
        clearInvalid: true,
        redirectTo: false,
        keepAlive: true, // reset expiry date every time
        isSecure: false, // cookie allows to be transmitted over insecure connection
        isHttpOnly: true, // auth cookie is unavailable to js
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
        ignoreErrors: false, // errors are ignored and treated as missing cookie
        clearInvalid: false
    });

    // Set up server side react views using Vision
    server.views({
        engines: { jsx: HapiReactViews },
        path: config.paths.serverViews
    });

    // Note: only one route per will be used to fulfill a request.
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

    // Catch-all
    // server.route({
    //     method: 'GET',
    //     path: '/{path*}',
    //     handler: function (request, reply) {
    //         reply('Hapi catch-all view for /' + encodeURIComponent(request.params.path));
    //     }
    // });

    // App
    server.route({
        method: 'GET',
        path: '/',
        config: {
            auth: {
                strategy: 'session',
                mode: 'try'
            }
        },
        handler: function(request, reply) {
            var isLoggedIn = request.auth.isAuthenticated;
            reply.view('about', { isLoggedIn: isLoggedIn }); // about.jsx in /views
        }
    });

    server.route({
        method: 'GET',
        path: '/{path*}',
        handler: {
            view: 'app' // app.jsx in /views
        }
    });

    server.route({
        method: 'GET',
        path: '/api/data',
        config: {
            auth: 'session',
            pre: [ checkCsrfToken ]
        },
        handler: queryHandler
    });

    server.route({
        method: 'POST',
        path: '/api/data',
        config: {
            auth: 'session',
            pre: [ checkCsrfToken ]
        },
        handler: queryHandler
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
        handler: function(request, reply) {
            request.auth.session.clear();
            reply(JSON.stringify('success'));
        }
    });

    server.route({
        method: 'POST',
        path: '/api/change-password',
        config: {
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
                    reply.view('app');
                })
                .catch(() => {
                    reply.redirect('/invalid-verification-link');
                });
        }
    });

    server.route({
        method: 'POST',
        path: '/api/resend-auth-token',
        config: {
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


    // Dev sandbox
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

        // Enable a separate sandbox
        server.route({
            method: 'GET',
            path: '/sandbox',
            handler: {
                view: 'sandbox' // sandbox.jsx in /views
            }
        });
    }

    server.start(() => {
        console.log('Hapi server started!');
    });
});
