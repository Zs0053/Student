const crypto = require('crypto');

/**
 * Encrypts a password using the PBKDF2 algorithm with the given salt.
 * @param {string} password - The password to be encrypted.
 * @param {string} salt - The salt to be used in the encryption.
 * @returns {string} The encrypted password as a hexadecimal string.
 */
function encryptPassword(password, salt) {
  const iterations = 1000;
  const keylen = 64;
  const digest = 'sha512';
  return crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
}

module.exports = encryptPassword;
