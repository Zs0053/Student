const crypto = require('crypto');

/**
 * Random value generator
 * 
 * @returns {string} - Random value 
 */
function randomGenerator() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = randomGenerator;
