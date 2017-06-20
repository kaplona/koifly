'use strict';


var Secrets = {
    // public data which is different on production and development
    domain: 'www.example.com',
    bareDomain: 'example.com',
    protocol: 'http',
    port: {
        https: 443,
        http: 80
    },

    // your DB config
    // Admin user is used for initial tables creation (has CREATE, ALTER, DROP privileges)
    dbAdmin: {
        database: 'database-name',
        mysqlUser: 'adminUser',
        mysqlPassword: 'very-very-safe-password',
        mysqlHost: 'host'
    },

    // This mysql user will be used by app to update db (only UPDATE, INSERT privileges)
    dbApp: {
        database: 'database-name',
        mysqlUser: 'appUser',
        mysqlPassword: 'very-safe-password',
        mysqlHost: 'host'
    },

    // your auth cookie config
    bcryptRounds: 10,
    cookiePassword: 'one-more-safe-password',
    cookieLifeTime: 1000 * 60 * 60 * 24 * 30, // one month

    // your mail agent config
    mailgunLogin: 'mailgun-login',
    mailgunPassword: 'mailgun-password',

    // your google-maps-api key
    googleMapsApiKey: 'key',

    // your google analytics tracking id
    googleTrackingId: 'UI-*******-**',

    // SSL assets
    shouldUseSSL: false, // true for production server with SSL certificate
    sslKeyFileName: 'absolute-path-to-your-private-key',
    sslCrtFileName: 'absolute-path-to-your-ssl-certificate',
    sslIntermediateCrtFileName: 'absolute-path-to-your-ssl-intermediate-certificate',
    sslRootCrtFileName: 'absolute-path-to-your-ssl-root-certificate',

    shouldConfirmACMEChallenge: false, // true for production server with Automated Certificate Management Environment
    sslACMEChallengeDir: 'path-to-your-acme-challenge-directory-from-web-root-directory'
};


module.exports = Secrets;
