'use strict';

var Promise = require('es6-promise').Promise;
var Bcrypt = require('bcrypt');
var Constants = require('./constants');


var BcryptPromise = {

    hash: function(password) {
        return new Promise((resolve, reject) => {
            Bcrypt.hash(password, Constants.bcryptRounds, (err, hash) => {
                if (hash && !err) {
                    resolve(hash);
                    return;
                }
                reject(err);
            });
        });
    },

    compare: function(newPassword, hash) {
        return new Promise((resolve, reject) => {
            Bcrypt.compare(newPassword, hash, (err, res) => {
                if (res && !err) {
                    resolve();
                    return;
                }
                reject(err);
            });
        });
    }
};


module.exports = BcryptPromise;
