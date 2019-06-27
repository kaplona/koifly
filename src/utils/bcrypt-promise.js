'use strict';

import Bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = require('../secrets').bcryptRounds;


const BcryptPromise = {
  hash: function(password) {
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


export default BcryptPromise;
