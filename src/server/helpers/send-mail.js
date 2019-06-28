'use strict';

import nodeMailer from 'nodemailer';
import secrets from '../../secrets';

/**
 * @param {string} emailAddress - recipient
 * @param {object} message - email message options: from, subject, text, html
 * @param {object} templateData - object keys represent template placeholder name which will be replaced with object value
 * e.g. { url: '/some-path' } will result in all '%url' in template to be replaced with '/some-path'
 * @returns {Promise} - whether email was send or error occurred
 */
export default function sendMail(emailAddress, message, templateData) {
  return new Promise((resolve, reject) => {
    // more options: https://nodemailer.com/smtp/
    const smtpConfig = {
      host: secrets.mailgunHost,
      auth: {
        user: secrets.mailgunLogin,
        pass: secrets.mailgunPassword
      }
    };
    const transporter = nodeMailer.createTransport(smtpConfig);

    message = Object.assign({}, message, { to: emailAddress });
    if (templateData) {
      Object.keys(templateData).forEach(key => {
        const rex = new RegExp('%' + key, 'g');
        message.text = message.text.replace(rex, templateData[key]);
        message.html = message.html.replace(rex, templateData[key]);
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
