'use strict';


var SecretsSample = {
    // public data which is different on production and development
    domain: 'http://example.com',

    // your DB config
    // Admin user is used for initial tables creation (has CREATE, ALTER, DROP privileges)
    dbAdmin: {
        database: 'database-name',
        mysqlUser: 'adminUser',
        mysqlPassword: 'very-very-save-password',
        mysqlHost: 'host'
    },

    // This mysql user will be used by app to update db (only UPDATE, INSERT privileges)
    dbApp: {
        database: 'database-name',
        mysqlUser: 'appUser',
        mysqlPassword: 'very-save-password',
        mysqlHost: 'host'
    },

    // your auth cookie config
    bcryptRounds: 10,
    cookiePassword: 'one-more-save-password',
    cookieLifeTime: 1000 * 60 * 60 * 24 * 30, // one month

    // your mail agent config
    mailgunLogin: 'mailgun-login',
    mailgunPassword: 'mailgun-password'
};


module.exports = SecretsSample;
