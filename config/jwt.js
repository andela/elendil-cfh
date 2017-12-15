/* jshint esversion: 6 */

const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./env/all');
/**
 * Class Definition for the Authentication Object using Jason Web Token
 *
 * @export
 * @class Auth
 */
exports.jwt = {
  /**
   * Verify JWT token
   *
   * @param {string} token
   * @returns {object} user
   * @memberof Auth
   */
  verify(token) {
    let user = {};
    if (token) {
      const secret = jwtSecret || '!^sl1@#=5';
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          user = { id: null };
        } else {
          user = decoded;
        }
      });
    } else {
      user = { id: null };
    }

    return user;
  },

  /**
   * Sign (Hash) User ID with JWT token
   *
   * @param {object} user - User id and email address
   * @returns {string} Encrypted string
   * @memberof Auth
   */
  sign(user) {
    this.secret = jwtSecret || '!^sl1@#=5';
    return jwt.sign(user, this.secret);
  }
};
