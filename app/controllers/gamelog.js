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
  gamelog.rounds = req.body.rounds;
  gamelog.save((err) => {
    if (err) {
      return res.json({ message: 'An error occured' });
    } else {
      return res.json({ message: 'Game history logged' });
    }
  });
};

module.exports.getLeaderBoard = (req, res) => {
  Gamelog.aggregate(
    [
      {"$group" : {_id:"$winner.username", count:{$sum:1}}}
    ],
    (err, gameLogs) => {
      if (err) {
        return res.json({ err });
      }
      if (gameLogs === 0) {
        return res.json({ message: 'no data' });
      }
    return res.json(gameLogs);
  });
};


module.exports.gameHistory = (req, res) => {
  Gamelog.find({}, (err, gameHistory) => {
    if (err) {
      return res.json({ err });
    }
    if (gameHistory === 0) {
      return res.json({ message: 'no data' });
    }

  return res.json(gameHistory);
  });
};
