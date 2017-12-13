
const jwt = require('../../config/jwt');

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  User = mongoose.model('User');
const avatars = require('./avatars').all();

/**
 * Auth callback
 * @param {object} req
 * @param {object} res
 * @returns{object} res
 */
exports.authCallback = (req, res) => {
  res.redirect('/chooseavatars');
};

/**
 * Show login form
 * @param {object} req
 * @param {object} res
 * @returns{object} res
 */
exports.signin = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signin?error=invalid');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Show login form
 * @param {object} req
 * @param {object} res
 * @returns{object} res
 */
exports.signup = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signup');
  } else {
    res.redirect('/#!/app');
  }
};
/**
 * Logout
 * @param {object} req
 * @param {object} res
 * @returns{object} res
 */
exports.signout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 * @param {object} req
 * @param {object} res
 * @returns{object} res
 */
exports.session = (req, res) => {
  res.redirect('/');
};

/**
 * Check avatar - Confirm if the user who logged in via passport
 * already has an avatar. If they don't have one, redirect them
 * to our Choose an Avatar page.
 * @param {object} req
 * @param {object} res
 * @returns{object} res
 */
exports.checkAvatar = (req, res) => {
  if (req.user && req.user._id) {
    User.findOne({
      _id: req.user._id
    })
      .exec((err, user) => {
        if (user.avatar !== undefined) {
          res.redirect('/#!/');
        } else {
          res.redirect('/#!/choose-avatar');
        }
      });
  } else {
    // If user doesn't even exist, redirect to /
    res.redirect('/');
  }
};

/*
* SignUp user with jwt
*/
exports.signupJwt = (req, res) => {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    })
      .exec()
      .then((err, existingUser) => {
        if (err) {
          return res.status(409).json({
            message: 'Email already taken!'
          });
        }
        if (!existingUser) {
          const user = new User(req.body);
          user.avatar = avatars[user.avatar];
          user.save((error, newUser) => {
            if (error) {
              return res.status(400).json({
                message: 'Unable to signUp'
              });
            }
            const userDetails = { id: newUser._id, email: newUser.email, name: newUser.name };

            const token = jwt.jwt.sign(userDetails);
            res.status(200).send({
              message: 'Signup successful. Token generated',
              token
            });
          });
        }
      });
  } else {
    return res.status(400).json({
      message: 'all fields must be filled'
    });
  }
};


/**
 * Create user
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns{object} res
 */
exports.create = (req, res, next) => {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }).exec((err, existingUser) => {
      if (!existingUser) {
        const user = new User(req.body);
        // Switch the user's avatar index to an actual avatar url
        user.avatar = avatars[user.avatar];
        user.provider = 'local';
        user.save((err) => {
          if (err) {
            return res.render('/#!/signup?error=unknown', {
              errors: err.errors,
              user
            });
          }
          req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect('/#!/');
          });
        });
      } else {
        return res.redirect('/#!/signup?error=existinguser');
      }
    });
  } else {
    return res.redirect('/#!/signup?error=incomplete');
  }
};

/**
 * @param {object} req
 * @param {object} res
 * @returns{object} res
 * Assign avatar to user
 */
exports.avatars = (req, res) => {
  // Update the current user's profile to include the avatar choice they've made
  if (req.user && req.user._id && req.body.avatar !== undefined &&
    /\d/.test(req.body.avatar) && avatars[req.body.avatar]) {
    User.findOne({
      _id: req.user._id
    })
      .exec((err, user) => {
        user.avatar = avatars[req.body.avatar];
        user.save();
      });
  }
  return res.redirect('/#!/app');
};

exports.addDonation = (req, res) => {
  if (req.body && req.user && req.user._id) {
    // Verify that the object contains crowdrise data
    if (req.body.amount && req.body.crowdrise_donation_id && req.body.donor_name) {
      User.findOne({
        _id: req.user._id
      })
        .exec((err, user) => {
          // Confirm that this object hasn't already been entered
          let duplicate = false;
          for (let i = 0; i < user.donations.length; i += 1) {
            if (
              user.donations[i].crowdrise_donation_id ===
              req.body.crowdrise_donation_id
            ) {
              duplicate = true;
            }
            if (!duplicate) {
              user.donations.push(req.body);
              user.premium = 1;
              user.save();
            }
          }
        });
    }
    res.send();
  }
};

/**
 * @param {object} req
 * @param {object} res
 * @returns{object} res
 *  Show profile
 */
exports.show = (req, res) => {
  const user = req.profile;

  res.render('users/show', {
    title: user.name,
    user
  });
};

/**
 * @param {object} req
 * @param {object} res
 * @returns{object} res
 * Send User
 */
exports.me = (req, res) => {
  res.jsonp(req.user || null);
};

/**
 * @returns{object} res
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @param {object} id
 * Find user by id
 */
exports.user = (req, res, next, id) => {
  User
    .findOne({
      _id: id
    })
    .exec((err, user) => {
      if (err) return next(err);
      if (!user) return next(new Error(`Failed to load User ${id}`));
      req.profile = user;
      next();
    });
};

/**
 * @description login function
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} next - Response object
 * @returns {object} json - payload
 */
exports.login = (req, res, next) => {
  const { email } = req.body;
  const { password } = req.body;
  if (!email || !password) {
    return res.status(400).send({
      message: 'email or password cannot be blank'
    });
  }
  User.findOne({ email }).exec((err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).send({ message: 'Incorrect username or password' });
    const checkPassword = user.authenticate(password);
    if (!checkPassword) return res.status(401).send({ message: 'Incorrect username or password' });
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email
    };
    const token = jwt.jwt.sign(userData);
    res.status(200).send({
      message: 'login successful',
      token
    });
  });
};

// Add Friends

exports.addFriend = (req, res) => {
  const { friendId, friendName } = req.body;
  const friendData = { friendId, friendName };
  const userId = req.body.userId; // change this....
  User.findOneAndUpdate(
    {
      _id: userId
    },
    {
      $push: { friends: friendData }
    }
  ).then(() => {
    res.status(200).json({
      message: 'Friend Added Succesfully'
    });
  })
    .catch((error) => {
      res.status(500).json({
        error,
        message: 'Internal Server Error'
      });
    });
};

exports.getFirendsList = (req, res) => {
  const userId = req.decoded.user;

  User.find({
    _id: userId
  }).then((user) => {
    if (user) {
      console.log(user);
      return res.status(200).json(user[0].friends);
    }
  })
    .catch((error) => {
      res.status(500).json({
        error,
        message: 'Internal Server Error'
      });
    });
};
