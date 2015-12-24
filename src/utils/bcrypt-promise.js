'use strict';

var Promise = require('es6-promise').Promise;
var Bcrypt = require('bcrypt');
var Constants = require('./constants');


var BcryptPromise = {

    hash: function(password) {
        return new Promise((resolve, reject) => {
            Bcrypt.hash(password, Constants.bcryptRound, (err, hash) => {
                if (hash) {
                    resolve(hash);
                }
                if (err) {
                    reject(err);
                }
            });
        });
    },

    compare: function(newPassword, hash) {
        return new Promise((resolve, reject) => {
            Bcrypt.compare(newPassword, hash, (err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res);
            });
        });
    }
};


module.exports = BcryptPromise;
