'use strict';


var SecretsSample = {
    // public data which is different on production and development
    domain: 'http://example.com',

    // your DB config
    database: 'database-name',
    mysqlUser: 'user',
    mysqlPassword: 'very-save-password',
    mysqlHost: 'host',

    // your auth cookie config
    bcryptRounds: 10,
    cookiePassword: 'one-more-save-password',
    cookieLifeTime: 1000 * 60 * 60 * 24 * 30, // one month

    // your mail agent config
    mailgunLogin: 'mailgun-login',
    mailgunPassword: 'mailgun-password'
};


module.exports = SecretsSample;
