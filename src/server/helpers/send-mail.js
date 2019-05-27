'use strict';

const _ = require('lodash');
const NodeMailer = require('nodemailer');

const MAILGUN_LOGIN = require('../../secrets').mailgunLogin;
const MAILGUN_PASSWORD = require('../../secrets').mailgunPassword;


/**
 * @param {string} emailAddress - recipient
 * @param {object} message - email message options: from, subject, text, html
 * @param {object} templateData - object keys represent template placeholder name which will be replaced with object value
 * e.g. { url: '/some-path' } will result in all '%url' in template to be replaced with '/some-path'
 * @returns {Promise} - whether email was send or error occurred
 */
const SendMail = function(emailAddress, message, templateData) {
  return new Promise((resolve, reject) => {
    // more options: https://github.com/nodemailer/nodemailer#set-up-smtp
    const smtpConfig = {
      service: 'Mailgun',
      auth: {
        user: MAILGUN_LOGIN,
        pass: MAILGUN_PASSWORD
      }
    };
    const transporter = NodeMailer.createTransport(smtpConfig);

    message = _.extend({}, message, { to: emailAddress });

    if (templateData) {
      _.each(templateData, (value, key) => {
        const rex = new RegExp('%' + key, 'g');
        message.text = message.text.replace(rex, value);
        message.html = message.html.replace(rex, value);
      });
    }

    transporter.sendMail(message, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};


module.exports = SendMail;
