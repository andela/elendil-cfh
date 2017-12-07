/* jshint esversion: 6 */

/* eslint-disable */

/**
 * Module dependencies.
 */
const _ = require('underscore');
const Gamelog = require('../models/gamelog'),
  avatars = require('./avatars').all();

module.exports.saveGameLog = function (req, res) {
  const gamelog = new Gamelog();
  gamelog.gameId = req.body.gameID;
  gamelog.players = req.body.players;
  gamelog.winner = req.body.winner;
  gamelog.save((err) => {
    if (err) {
      return res.json({ message: 'An error occured' });
    } else {
      return res.json({ message: 'Game history logged' });
    }
  });
};