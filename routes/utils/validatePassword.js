const crypto = require('crypto');

/**
 * Validates a password by comparing it with the stored hash.
 * @param {string} password - The password to be validated.
 * @param {string} hash - The hash of the stored password.
 * @param {string} salt - The salt value used to encrypt the stored password.
 * @returns {boolean} True if the password is valid, false otherwise.
 */
function validatePassword(password, hash, salt) {
  const iterations = 1000;
  const keylen = 64;
  const digest = 'sha512';
  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
  return hash === derivedKey;
}

module.exports = validatePassword;
