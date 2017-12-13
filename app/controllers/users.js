/* jshint esversion: 6 */
const jwt = require('../../config/jwt');
const nodemailer = require('nodemailer');

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
          user.avatar = avatars[+req.body.avatar];
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


/**
 * @description getDonations function
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {object} json - payload
 */
exports.getDonations = (req, res) => {
  User.find()
    .then((response) => {
      if (response.length === 0) {
        return res.send({ message: 'no data' });
      }
      const donationData = [];
      response.forEach((array) => {
        donationData.push({ name: array.name, avatar: array.avatar, donations: array.donations.length });
      });
      res.send(donationData);
    })
    .catch((error) => {
      res.send(error);
    });
}

exports.searchUsers = (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({
      message: 'Nothing to search'
    });
  }
  User.find({
    $or: [
      { email: { $regex: `.*${q}.*` } }, { username: { $regex: `.*${q}.*` } }
    ]
  }, 'email name').exec((err, user) => {
    if (err) {
      return res.status(500).json({ Message: 'Internal server error' });
    }
    if (user.length <= 0) {
      return res.status(200).json({
        message: 'User not found!'
      });
    }
    return res.status(200).json({ user });
  });
};

exports.sendInvites = (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    port: 465,
    auth: {
      user: process.env.username,
      pass: process.env.password
    }
  });

  const mailOption = {
    from: 'Cards for Humanity Elendil',
    to: req.body.email,
    subject: 'Invitation to join a current game session',
    text: `Click this link to join game: ${req.body.gameLink}`,
    html: `
    <div style="width: 40%; margin: 0 auto; padding: 3%;" >
      <div style="background-color: #256188; color: #FFF; padding: 1%; text-align: center;">
        <h4 class="modal-title">Card For Humanity - Elendil</h4>
      </div>
      <center>
        <p>You have been invited to join a game session.</p>
        <p>
        Click this link to join game:
        <a href="${req.body.gameLink}"><button style="background: #F6A623; color: #FFF; padding: 2%; border:0; border-radius: 5px;" >Join Game</button></a>
         
         </p>
      </center>
      <div style="font-size: 14px; margin-top: 6px; color: #fff; text-align: center; background-color: #256188; padding: 0.5%;">
        <p>Cards for Humanity - Elendil &copy; 2017 <br/> <a style="color: #F6A623;" href="http://www.andela.com">Andela</a></p>
      <div>
    </div>
    `
  };

  transporter.sendMail(mailOption, (error) => {
    if (error) {
      return res.status(400).json({
        error,
        message: 'An error occured while trying to send your invite!'
      });
    }
    return res.status(200).json({
      message: 'Message sent Successfully'
    });
  });
};
