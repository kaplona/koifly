'use strict';

const secrets = {
  // public data which is different on production and development
  domain: 'www.example.com',
  bareDomain: 'example.com',
  protocol: 'http',
  port: {
    https: 443,
    http: 80
  },
  // Set these parameters if your Node server is run behind another one, e.g. nginx, otherwise leave empty.
  // This public root url will be used in emails as link to your application
  publicRootUrl: 'http://example.com',
  // Cookie set on example.com domain will be available for www.example.com too.
  cookieDomain: 'example.com',

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
  cookiePassword: 'one-more-safe-password', // must be min 32 char long
  cookieLifeTime: 1000 * 60 * 60 * 24 * 30, // one month

  // your mail agent config
  mailgunHost: 'smtp.mailgun.org',
  mailgunLogin: 'mailgun-login',
  mailgunPassword: 'mailgun-password',

  // your google maps api key which is restricted to your server IP address
  // to be used on the backend.
  // For development, you can use the same unrestricted key as for the frontend.
  googleServerSideApiKey: 'key',

  // your google analytics tracking id
  googleTrackingId: 'UI-*******-**', // empty string to disable tracking script

  // SSL assets
  shouldUseSSL: false, // true for production server with SSL certificate
  sslKeyFileName: 'absolute-path-to-your-private-key',
  sslCrtFileName: 'absolute-path-to-your-ssl-certificate',
  sslIntermediateCrtFileName: 'absolute-path-to-your-ssl-intermediate-certificate',
  sslRootCrtFileName: 'absolute-path-to-your-ssl-root-certificate',

  shouldConfirmACMEChallenge: false, // true for production server with Automated Certificate Management Environment
  sslACMEChallengeDir: 'path-to-your-acme-challenge-directory-from-web-root-directory'
};


module.exports = secrets;
