/* jshint esversion: 6 */

let async = require('async');

module.exports = (app, passport, auth) => {
  // User Routes
  let users = require('../app/controllers/users');
  app.get('/signin', users.signin);
  app.get('/signup', users.signup);
  app.get('/chooseavatars', users.checkAvatar);
  app.get('/signout', users.signout);
  app.post('/api/auth/login', users.login);
  app.get('/api/search/users', users.searchUsers);
  app.post('/api/users/invite', users.sendInvites);
  app.post('/api/region', users.setRegion);

  // Setup routes with api prefix
  app.post('/api/auth/signup', users.signupJwt);

  //Setting up the users api
  app.post('/users', users.create);
  app.post('/users/avatars', users.avatars);

  // Donation Routes
  app.post('/donations', users.addDonation);
  app.get('/api/donations', users.getDonations);

  app.post('/users/session', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: 'Invalid email or password.'
  }), users.session);

  app.get('/users/me', users.me);
  app.get('/users/:userId', users.show);

  // Setting the facebook oauth routes
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email'],
    failureRedirect: '/signin'
  }), users.signin);

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/signin'
  }), users.authCallback);

  // Setting the github oauth routes
  app.get('/auth/github', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), users.signin);

  app.get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), users.authCallback);

  // Setting the twitter oauth routes
  app.get('/auth/twitter', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), users.signin);

  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), users.authCallback);

  // Setting the google oauth routes
  app.get('/auth/google', passport.authenticate('google', {
    failureRedirect: '/signin',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  }), users.signin);

  app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/signin'
  }), users.authCallback);

  // Finish with setting up the userId param
  app.param('userId', users.user);

  // Answer Routes
  let answers = require('../app/controllers/answers');
  app.get('/answers', answers.all);
  app.get('/answers/:answerId', answers.show);
  
  // Finish with setting up the answerId param
  app.param('answerId', answers.answer);

  // Question Routes
  let questions = require('../app/controllers/questions');
  app.get('/questions', questions.all);
  app.get('/questions/:questionId', questions.show);
  // Finish with setting up the questionId param
  app.param('questionId', questions.question);

  // Avatar Routes
  let avatars = require('../app/controllers/avatars');
  app.get('/avatars', avatars.allJSON);

  //Home route
  let index = require('../app/controllers/index');
  app.get('/play', index.play);
  app.get('/tour', index.tour);
  app.get('/', index.render);

  // Log Game History
  let logGame = require('../app/controllers/gamelog');
  app.post('/api/games/:gameID/start');
  app.param('gameID', logGame.saveGameLog);

  app.get('/api/leaderboard', logGame.getLeaderBoard);
  app.get('/api/games/history', logGame.gameHistory);
};
