'use strict';

const Bcrypt = require('bcrypt');
const BCRYPT_ROUNDS = require('../secrets').bcryptRounds;
const Promise = require('es6-promise').Promise;


const BcryptPromise = {

  hash: function (password) {
    return new Promise((resolve, reject) => {
      Bcrypt.hash(password, BCRYPT_ROUNDS, (err, hash) => {
        if (hash && !err) {
          resolve(hash);
          return;
        }
        reject(err);
      });
    });
  },

  compare: function (newPassword, hash) {
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
