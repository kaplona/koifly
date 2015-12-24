'use strict';

var config = require('./config/variables');
var path = require('path');
var Hapi = require('hapi');
var Inert = require('inert');
var Vision = require('vision');
var HapiReactViews = require('hapi-react-views');
var AuthCookie = require('hapi-auth-cookie');
var SetCookie = require('./server-handlers/helpers/set-cookie');
var CheckCookie = require('./server-handlers/check-cookie');
var QueryHandler = require('./server-handlers/query-handler');
var SignInHandler = require('./server-handlers/sign-in-handler');
var LogInHandler = require('./server-handlers/log-in-handler');
var ChangePassHandler = require('./server-handlers/change-pass-handler');
var ResetPassHandler= require('./server-handlers/reset-pass-handler');
var VerifyEmailToken = require('./server-handlers/helpers/verify-email');
var SendToken = require('./server-handlers/helpers/send-token');
var EmailMessages = require('./server-handlers/helpers/email-messages');
var Constants = require('./utils/constants');


var server = new Hapi.Server();

server.connection({
    host: config.server.host,
    port: config.server.port
});



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



server.register(plugins, (err) => {

    if (err) {
        console.error(err);
        return;
    }

    // Register cookie authentication scheme
    server.auth.strategy('session', 'cookie', {
        cookie: 'koifly',
        password: Constants.cookiePassword,
        ttl: (1000*60*60*24*30),
        clearInvalid: true,
        redirectTo: false,
        keepAlive: true,
        isSecure: false, // cookie allows to be transmitted over insecure connection
        isHttpOnly: false,
        validateFunc: CheckCookie
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
    config.server.publicFiles.forEach(
        (filename) => {
            server.route({
                method: 'GET',
                path: '/' + filename,
                handler: {
                    file: {
                        path: path.join(config.paths.webRoot, filename)
                    }
                }
            });
        }
    );

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
        path: '/{path*}',
        handler: {
            view: 'app' // app.jsx in /views
        }
    });

    server.route({
        method: 'GET',
        path: '/api/data',
        config: { auth: 'session' },
        handler: function(request, reply) {
            QueryHandler(request, reply);
        }
    });

    server.route({
        method: 'POST',
        path: '/api/data',
        config: { auth: 'session' },
        handler: function(request, reply) {
            QueryHandler(request, reply);
        }
    });

    server.route({
        method: 'POST',
        path: '/api/signin',
        handler: function(request, reply) {
            SignInHandler(request, reply);
        }
    });

    server.route({
        method: 'POST',
        path: '/api/login',
        handler: function(request, reply) {
            LogInHandler(request, reply);
        }
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
        path: '/api/change-pass',
        config: { auth: 'session' },
        handler: function(request, reply) {
            ChangePassHandler(request, reply);
        }
    });

    server.route({
        method: 'GET',
        path: '/email/{token}',
        handler: function(request, reply) {
            VerifyEmailToken(request.params.token).then((user) => {
                SetCookie(request, user.id, user.password);
                reply.redirect('/verified');
            }).catch(() => {
                reply.redirect('/invalid-token');
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/api/resend-token',
        config: { auth: 'session' },
        handler: function(request, reply) {
            var userCredentials = { id: request.auth.credentials.userId };
            SendToken(reply, userCredentials, EmailMessages.EMAIL_VERIFICATION, '/email');
        }
    });

    server.route({
        method: 'GET',
        path: '/api/one-time-login',
        handler: function(request, reply) {
            var userCredentials = { email: JSON.parse(request.query.email) };
            SendToken(reply, userCredentials, EmailMessages.ONE_TIME_LOGIN, '/email');
        }
    });

    server.route({
        method: 'GET',
        path: '/api/reset-pass',
        handler: function(request, reply) {
            var userCredentials = { email: JSON.parse(request.query.email) };
            SendToken(reply, userCredentials, EmailMessages.PASSWORD_RESET, '/reset-pass');
        }
    });

    server.route({
        method: 'POST',
        path: '/api/reset-pass',
        handler: function(request, reply) {
            ResetPassHandler(request, reply);
        }
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

        // Proxy webpack HMR requests to webpack-dev-server
        server.route({
            method: 'GET',
            path: '/__webpack_hmr', // this includes HMR patches, not just webpack bundle files
            handler: {
                proxy: {
                    host: config.server.host,
                    port: config.webpack.port,
                    passThrough: true
                }
            }
        });

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
