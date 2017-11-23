var jwt = require('jsonwebtoken');

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
   * @param {object} req - HTTP Request
   * @param {object} res - HTTP Response
   * @param {function} next - HTTP Next()
   * @returns {object} Class instance
   * @memberof Auth
   */
  verify(req, res, next) {
    var token = req.body.token
    || req.query.token
    || req.headers['x-access-token'];

    if (token) {
      var secret = process.env.jwtSecret || '!^sl1@#=5';
      jwt.verify(token, secret, function (err, decoded) {
        if (err) {
          return res.status(401).json({ success: false,
            message: 'Failed to authenticate token.' });
        }
        req.user = decoded;
        next();
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'No token provided.'
      });
    }

    return this;
  },

  /**
   * Sign (Hash) User ID with JWT token
   *
   * @param {object} user - User id and email address
   * @returns {string} Encrypted string
   * @memberof Auth
   */
  sign(user) {
    this.secret = process.env.jwtSecret || '!^sl1@#=5';
    return jwt.sign(user, this.secret);
  }
};
