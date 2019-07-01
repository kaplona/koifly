import crypto from 'crypto';

/**
 * @param {number} len - length of token to generate
 * @returns {string} - string of certain length of random chars (a-z, A-Z, 0-9)
 */
export default function generateToken(len = 32) {
  return crypto
    .randomBytes(len) // generates cryptographically strong pseudo-random number of bytes (octet buffer)
    .toString('base64') // decodes buffer data using base64 encoding (character set: a-z, A-Z, 0-9, / , +)
    .replace(/\+/g, '-') // replace '+' to '-' in order to the token to be safe for url
    .replace(/\//g, '_') // replace '/' to '_' in order to the token to be safe for url
    .slice(0, len); // take only certain amount of first characters
}
