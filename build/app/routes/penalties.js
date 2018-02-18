// footballatfairview/app/routes/penalties.coffee
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
  app.get('/penalties/add', isLoggedIn, function(req, res) {
    Penalty.find({}, function(penalty_err, penalties) {
      if (penalty_err) {
        return console.log(penalty_err);
      }
      User.find({}, function(user_err, users) {
        if (user_err) {
          return console.log(user_err);
        }
        List.find({}, function(list_err, matches) {
          if (list_err) {
            console.log(list_err);
            return;
          }
          res.render('penalties/add.ejs', {
            message: req.flash('loginMessage'),
            users: users,
            penalties: penalties,
            matches: matches,
            user: req.user,
            moment: moment,
            title: 'Penalties'
          });
        });
      });
    });
  });
  // app.post '/penalties/add', isLoggedIn, (req, res) ->
  app.post('/penalties/add', function(req, res) {
    var match_id, newUserPenalty, penalty_id, player_id;
    // TODO validate params
    player_id = req.body.player_id;
    penalty_id = req.body.penalty_id;
    match_id = req.body.match_id;
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
  app.get('/penalty/create', isLoggedIn, function(req, res) {
    List.find({}, function(err, list) {
      if (err) {
        return console.log(err);
      }
      res.render('penalties/create.ejs', {
        message: req.flash('loginMessage'),
        lists: list,
        user: req.user,
        moment: moment,
        title: 'Penalties'
      });
    });
  });
  // app.post '/penalties/create', isLoggedIn, (req, res) ->
  app.post('/penalty/create', function(req, res) {
    var description, error, errors, paramError, penalty, title;
    try {
      title = req.body.title;
      description = req.body.description;
    } catch (error1) {
      error = error1;
    }
    // TODO
    errors = {};
    if (typeof title === 'undefined' || title === '') {
      errors.title = "Title not informed";
      paramError = true;
    }
    if (typeof description === 'undefined' || description === '') {
      errors.description = "Description not informed";
      paramError = true;
    }
    if (paramError) {
      return res.json({
        "message": "Please inform all params",
        "errors": errors,
        "errMessage": "Params have not been informed correctly",
        "params": req.body
      });
    }
    penalty = new Penalty({
      title: title,
      description: description
    });
    penalty.save(function(err, result, numAffected) {
      if (err) {
        console.log(err);
        return res.json({
          "message": err.message,
          "errors": err
        });
      }
      return res.json({
        "message": "Created successfully"
      });
    });
  });
  app.get('/penalty/edit/', isLoggedIn, function(req, res) {
    Penalty.find({}, function(err, penalties) {
      if (err) {
        return console.log(err);
      }
      console.log(penalties);
      res.render('penalties/list.ejs', {
        message: req.flash('loginMessage'),
        penalties: penalties,
        user: req.user,
        moment: moment,
        title: 'Penalties'
      });
    });
  });
  app.get('/penalty/edit/:penalty_id', isLoggedIn, function(req, res) {
    var penalty_id;
    // TODO validate params
    penalty_id = req.params.penalty_id;
    Penalty.findOne({
      _id: penalty_id
    }, function(err, penalty) {
      if (err) {
        return console.log(err);
      }
      res.render('penalties/penalty.ejs', {
        message: req.flash('loginMessage'),
        penalty: penalty,
        user: req.user,
        moment: moment,
        title: 'Penalty'
      });
    });
  });
  app.get('/penalties/view', isLoggedIn, function(req, res) {
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
  // app.post '/penalty/delete', isLoggedIn, (req, res) ->
  app.post('/penalty/delete', function(req, res) {
    var error, errors, paramError, penalty_id;
    try {
      penalty_id = req.body.penalty_id;
    } catch (error1) {
      error = error1;
      return res.json({
        "errMessage": error
      });
    }
    errors = {};
    if (typeof penalty_id === 'undefined' || penalty_id === '') {
      errors.penalty_id = "Penalty ID not informed";
      paramError = true;
    }
    if (paramError) {
      return res.json({
        "message": "Please inform all params",
        "errors": errors,
        "errMessage": "Params have not been informed correctly",
        "params": req.body
      });
    }
    Penalty.deleteOne({
      _id: penalty_id
    }, function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result.n > 0) {
        return res.json({
          "message": "Deleted successfully"
        });
      }
      return res.json({
        "message": "Operation failed",
        "errMessage": "0 Documents have been deleted"
      });
    });
  });
  // app.post '/penalty/update', isLoggedIn, (req, res) ->
  app.post('/penalty/update', function(req, res) {
    var description, error, errors, paramError, penalty_id, title;
    try {
      penalty_id = req.body.penalty_id;
      title = req.body.title;
      description = req.body.description;
    } catch (error1) {
      error = error1;
      return res.json({
        "errMessage": error
      });
    }
    errors = {};
    if (typeof penalty_id === 'undefined' || penalty_id === '') {
      errors.penalty_id = "Penalty ID not informed";
      paramError = true;
    }
    if (typeof title === 'undefined' || title === '') {
      errors.title = "Title not informed";
      paramError = true;
    }
    if (typeof description === 'undefined' || description === '') {
      errors.description = "Description not informed";
      paramError = true;
    }
    if (paramError) {
      return res.json({
        "message": "Please inform all params",
        "errors": errors,
        "errMessage": "Params have not been informed correctly",
        "params": req.body
      });
    }
    Penalty.findOneAndUpdate({
      _id: penalty_id
    }, {
      $set: {
        title: title,
        description: description
      }
    }, {
      'new': true,
      'rawResult': false
    }, function(err, result) {
      if (err) {
        console.log(err);
      }
      return res.json({
        "message": result
      });
      return res.json({
        "message": "Operation failed",
        "errMessage": "0 Documents have been updated"
      });
    });
  });
};
