var List, ObjectId, Penalty, User, UserPenalty, _, isLoggedIn, moment, uuid;

List = require('../models/list');

User = require('../models/user');

Penalty = require('../models/penalty');

UserPenalty = require('../models/user_penalty');

moment = require('moment');

uuid = require('node-uuid');

_ = require("underscore");

ObjectId = require('mongodb').ObjectID;

isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

module.exports = function(app) {
  app.get('/penalties', isLoggedIn, function(req, res) {
    res.render('penalties/index.ejs', {
      message: req.flash('loginMessage'),
      user: req.user,
      moment: moment,
      title: 'Penalties'
    });
  });
  app.get('/penalties/create', isLoggedIn, function(req, res) {
    Penalty.find({}, function(p_err, p_list) {
      if (p_err) {
        return console.log(p_err);
      }
      User.find({}, function(err, list) {
        if (err) {
          return console.log(err);
        }
        List.find({
          list_status: "active"
        }, function(l_err, l_list) {
          if (l_err) {
            return console.log(l_err);
          }
          res.render('penalties/create.ejs', {
            message: req.flash('loginMessage'),
            users: list,
            penalties: p_list,
            matches: l_list,
            user: req.user,
            moment: moment,
            title: 'Penalties'
          });
        });
      });
    });
  });
  app.post('/penalties/create', function(req, res) {
    var match_id, newUserPenalty, penalty_id, player_id;
    player_id = req.body.player_id;
    penalty_id = req.body.penalty_id;
    match_id = req.body.match_id;
    console.log(player_id, penalty_id, match_id);
    newUserPenalty = new UserPenalty({
      player_id: player_id,
      penalty_id: penalty_id,
      match_id: match_id
    });
    newUserPenalty.save(function(err, result, numAffected) {
      if (err) {
        console.log(err);
        return res.status(422).json({
          message: err
        });
      }
      res.json({
        message: newUserPenalty._id
      });
    });
  });
  app.get('/penalties/edit', isLoggedIn, function(req, res) {
    List.find({}, function(err, list) {
      if (err) {
        return console.log(err);
      }
      res.render('penalties/edit.ejs', {
        message: req.flash('loginMessage'),
        lists: list,
        user: req.user,
        moment: moment,
        title: 'Penalties'
      });
    });
  });
  return app.get('/penalties/view', isLoggedIn, function(req, res) {
    List.find({}, function(err, list) {
      if (err) {
        return console.log(err);
      }
      res.render('penalties/view.ejs', {
        message: req.flash('loginMessage'),
        lists: list,
        user: req.user,
        moment: moment,
        title: 'Penalties'
      });
    });
  });
};
