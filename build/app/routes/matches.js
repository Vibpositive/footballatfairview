var List, ObjectId, Penalty, Q, User, UserPenalty, _, addMatchToUser, addUserToMatch, isLoggedIn, moment, removeMatchFomUser, removeUserFromMatch, uuid;

List = require('../models/list');

User = require('../models/user');

moment = require('moment');

uuid = require('node-uuid');

_ = require("underscore");

Penalty = require('../models/penalty');

UserPenalty = require('../models/user_penalty');

ObjectId = require('mongodb').ObjectID;

Q = require('q');

// FIXME: change list_date to match_date
isLoggedIn = function(req, res, next) {
  // TODO: implement isLoggedIn in the request
  return next();
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

// TODO: disable edit access if match has already happened
addMatchToUser = function(user, match, next) {
  var deferred;
  deferred = Q.defer();
  User.update({
    _id: ObjectId(user.player_id)
  }, {
    $addToSet: {
      'matches': match
    }
  }, function(err, numAffected) {
    if (err) {
      deferred.resolve(err);
    }
    return deferred.resolve(numAffected);
  });
  return deferred.promise;
};

removeMatchFomUser = function(player_id, match, next) {
  var deferred;
  deferred = Q.defer();
  User.findByIdAndUpdate({
    _id: ObjectId(player_id)
  }, {
    $pull: {
      'matches': match
    }
  }, {
    'new': true
  }, function(err, doc) {
    var errMessage;
    if (err) {
      return errMessage = err.message;
    }
  });
  // FIXME matches not being found
  // deferred.resolve doc.matches.indexOf(match)
  return deferred.promise;
};

addUserToMatch = function(user, list_id) {
  var deferred;
  deferred = Q.defer();
  List.findOne({
    _id: list_id,
    names: 'undefined'
  }, function(err, doc) {
    var query, update;
    update = {};
    if (doc) {
      query = {
        _id: list_id,
        names: 'undefined',
        'names.player_id': {
          $ne: ObjectId(user.player_id)
        }
      };
      update = {
        $set: {
          "names.$": user
        }
      };
    } else {
      query = {
        _id: list_id,
        'names.player_id': {
          $ne: ObjectId(user.player_id)
        }
      };
      update = {
        $push: {
          'names': {
            player_id: user.player_id,
            datetime: 'date',
            last_name: user.last_name,
            first_name: user.first_name,
            full_name: user.full_name,
            status: "playing",
            phone: user.phone
          }
        }
      };
    }
    return List.findOneAndUpdate(query, update, {
      'new': true,
      'rawResult': true
    }, function(err, doc2) {
      var errMessage, message, response;
      if (err) {
        errMessage = err.message;
      }
      message = doc2.value ? "Added" : "User already on match";
      response = {
        "message": message,
        "errMessage": errMessage
      };
      return deferred.resolve(response);
    });
  });
  return deferred.promise;
};

removeUserFromMatch = function(player_id, list_id) {
  var deferred;
  deferred = Q.defer();
  List.findOne({
    '_id': list_id
  }, function(err, doc) {
    var options, response;
    response = {};
    if (err) {
      response = {
        "message": "",
        "doc": doc,
        "errMessage": err.message
      };
    }
    if (!doc) {
      response = {
        "message": "Match not found",
        "errMessage": "Please inform a valid match"
      };
    }
    if (doc.names.length > doc.list_size) {
      options = {
        $pull: {
          names: {
            player_id: ObjectId(player_id)
          }
        }
      };
    } else {
      options = {
        $set: {
          "names.$": "undefined"
        }
      };
    }
    return List.findOneAndUpdate({
      '_id': list_id,
      'names.player_id': ObjectId(player_id)
    }, options, {
      'new': true,
      'rawResult': false
    }, function(err, doc) {
      if (err) {
        response = {
          "message": "",
          "doc": doc,
          "errMessage": err.message
        };
      }
      if (!doc) {
        response = {
          "message": "Player not in this match96",
          "errMessage": "Please inform a valid match and user"
        };
      } else {
        response = {
          "message": "Removed successfully",
          "errMessage": "",
          "doc": doc
        };
      }
      return deferred.resolve(response);
    });
  });
  return deferred.promise;
};

// TODO implement
// getTimeToMatch = (list) ->
//   currentTime = moment()
//   matchTime = moment(list.list_date, "x")
//   diffMinutes = matchTime.diff(currentTime, 'minutes')
//   return diffMinutes

// TODO implement
// addPenaltyToUser = (user, match, next) ->
//   User.findByIdAndUpdate {
//     _id: user.player_id,
//     matches: {
//       $in: [match]
//     }
//   },
//   {
//     $inc: { penalties: 1 }
//   },
//   (err, doc) ->
//     undefined
module.exports = function(app) {
  app.get('/matches', isLoggedIn, function(req, res, next) {
    // console.log
    List.find({}, function(err, list) {
      if (err) {
        next(err);
      }
      res.render('matches/index.ejs', {
        message: req.flash('loginMessage'),
        lists: list,
        user: req.user,
        moment: moment,
        title: 'Matches List'
      });
    });
  });
  app.post('/match/get/players', isLoggedIn, function(req, res, next) {
    List.findOne({
      _id: req.body.list_id
    }, function(err, list) {
      if (err) {
        next(err);
      }
      res.render('matches/names/names_list.ejs', {
        message: req.flash('loginMessage'),
        list: list,
        user: req.user,
        moment: moment,
        title: "Matches index"
      });
    });
  });
  app.post('/match/delete/player', isLoggedIn, function(req, res, next) {
    var errMessage, errors, inputFault, list_id, paramError, updated, user;
    list_id = req.body.list_id;
    errMessage = "";
    user = {};
    updated = 0;
    inputFault = false;
    user.player_id = req.user ? new ObjectId(req.user.id) : new ObjectId(req.body.player_id);
    user.last_name = req.user ? req.user.facebook.last_name : req.body.last_name;
    user.first_name = req.user ? req.user.facebook.first_name : req.body.first_name;
    user.full_name = req.user ? req.user.facebook.first_name + " " + req.user.facebook.last_name : req.body.first_name + " " + req.body.last_name;
    user.phone = req.user ? req.user.phone : req.body.phone;
    errors = {};
    if (typeof user.player_id === 'undefined' || user.player_id === '') {
      errors.player_id = "Player ID not informed";
      paramError = true;
    }
    if (typeof user.last_name === 'undefined' || user.last_name === '') {
      errors.last_name = "Player last name not informed";
      paramError = true;
    }
    if (typeof user.first_name === 'undefined' || user.first_name === '') {
      errors.first_name = "Player first name not informed";
      paramError = true;
    }
    if (typeof user.full_name === 'undefined' || user.full_name === '') {
      errors.full_name = "Player full name not informed";
      paramError = true;
    }
    if (typeof user.phone === 'undefined' || user.phone === '') {
      errors.phone = "Player phone name not informed";
      paramError = true;
    }
    if (paramError) {
      return res.json({
        "message": "Please inform all params",
        "errors": errors,
        "errMessage": "Params have not been informed correctly"
      });
    }
    return removeUserFromMatch(user.player_id, list_id).then(function(data) {
      removeMatchFomUser(user.player_id, list_id);
      return res.json(data);
    });
  });
  app.post('/match/add/player', isLoggedIn, function(req, res, next) {
    var errMessage, errors, inputFault, list_id, paramError, updated, user;
    list_id = req.body.list_id;
    errMessage = "";
    user = {};
    updated = 0;
    inputFault = false;
    user.player_id = req.user ? new ObjectId(req.user.id) : new ObjectId(req.body.player_id);
    user.last_name = req.user ? req.user.facebook.last_name : req.body.last_name;
    user.first_name = req.user ? req.user.facebook.first_name : req.body.first_name;
    user.full_name = req.user ? req.user.facebook.first_name + " " + req.user.facebook.last_name : req.body.first_name + " " + req.body.last_name;
    user.phone = req.user ? req.user.phone : req.body.phone;
    errors = {};
    if (typeof user.player_id === 'undefined' || user.player_id === '') {
      errors.player_id = "Player ID not informed";
      paramError = true;
    }
    if (typeof user.last_name === 'undefined' || user.last_name === '') {
      errors.last_name = "Player last name not informed";
      paramError = true;
    }
    if (typeof user.first_name === 'undefined' || user.first_name === '') {
      errors.first_name = "Player first name not informed";
      paramError = true;
    }
    if (typeof user.full_name === 'undefined' || user.full_name === '') {
      errors.full_name = "Player full name not informed";
      paramError = true;
    }
    if (typeof user.phone === 'undefined' || user.phone === '') {
      errors.phone = "Player phone name not informed";
      paramError = true;
    }
    if (paramError) {
      return res.json({
        "message": "Please inform all params",
        "errors": errors,
        "errMessage": "Params have not been informed correctly"
      });
    }
    return addUserToMatch(user, list_id).then(function(data) {
      addMatchToUser(user, list_id);
      return res.json(data);
    });
  });
  app.get('/match/get/:list_id', isLoggedIn, function(req, res, next) {
    var list_id, player_id;
    list_id = req.params.list_id;
    player_id = req.user.id;
    List.findOne({
      '_id': list_id
    }, function(err, doc) {
      var player_is_on_list;
      player_is_on_list = _.find(doc.names, function(player) {
        return String(player.player_id) === String(player_id);
      });
      return List.findOne({
        _id: ObjectId(list_id)
      }, function(err, list) {
        if (err) {
          console.log(err);
          res.send(err);
        }
        return res.render('matches/match.ejs', {
          message: req.flash('loginMessage'),
          list: list,
          match_date: moment(list.list_date, "x"),
          user: req.user,
          player_is_on_list: player_is_on_list ? true : false,
          moment: moment,
          disabled: list.list_status === 'deactivate' ? 'disabled' : '',
          title: "Match"
        });
      });
    });
  });
  app.get('/match/get/players/:list_id', isLoggedIn, function(req, res, next) {
    List.findOne({
      _id: ObjectId(req.params.list_id)
    }, function(err, result) {
      if (err) {
        return console.log('err', err);
      }
      res.render('matches/players.ejs', {
        message: req.flash('loginMessage'),
        list: result,
        match_date: moment(result.list_date, 'x'),
        user: req.user,
        title: "Match: details"
      });
    });
  });
  // Show a view to create matches
  app.get('/match/create', isLoggedIn, function(req, res, next) {
    res.render('matches/create.ejs', {
      title: 'Create a match'
    });
  });
  // Show all matches in a edit view
  app.get('/matches/edit', isLoggedIn, function(req, res, next) {
    return List.find({}, function(err, list) {
      if (err) {
        res.send(err);
        return;
      }
      res.render('matches/list.ejs', {
        message: req.flash('loginMessage'),
        lists: list,
        user: req.user,
        moment: moment,
        title: "Matches index"
      });
    });
  });
  // Show a match in a edit view
  app.get('/match/edit/:list_id', isLoggedIn, function(req, res, next) {
    var list_id;
    list_id = req.params.list_id;
    List.findOne({
      _id: list_id
    }, {}, function(err, doc) {
      if (err) {
        return {
          message: err
        };
      } else {
        res.render('matches/edit.ejs', {
          message: '',
          list: doc,
          user: req.user,
          moment: moment,
          title: 'Matches List'
        });
      }
    });
  });
  app.post('/match/remove/player', isLoggedIn, function(req, res, next) {
    var errors, list_id, paramError, player_id, player_status;
    paramError = false;
    errors = {};
    list_id = req.body.list_id;
    player_status = req.body.player_status;
    player_id = req.body.player_id;
    if (typeof list_id === 'undefined' || list_id === '') {
      errors.list_id = "Match ID not informed correctly";
      paramError = true;
    }
    if (typeof player_status === 'undefined' || player_status === '') {
      errors.player_status = "Player status not informed correctly";
      paramError = true;
    }
    if (typeof player_id === 'undefined' || player_id === '') {
      errors.player_id = "Player ID full name not informed correctly";
      paramError = true;
    }
    if (paramError) {
      return res.json({
        "message": "Please inform all params",
        "errors": errors,
        "errMessage": "Params have not been informed correctly"
      });
    }
    return removeUserFromMatch(player_id, list_id).then(function(data) {
      return res.json(data);
    });
  });
  app.post('/match/create', isLoggedIn, function(req, res, next) {
    var errMessage, errors, i, index, isParticipating, list_date, list_size, list_status, match, message, names, paramError, ref, ref1, rowsAffected, start;
    paramError = false;
    errors = {};
    list_date = req.body.list_date;
    list_size = req.body.list_size;
    list_status = req.body.list_status;
    if (typeof list_date === 'undefined' || list_date === '') {
      errors.list_date = "List date not informed correctly";
      paramError = true;
    }
    if (typeof list_size === 'undefined' || list_size === '') {
      errors.list_size = "List size not informed correctly";
      paramError = true;
    }
    if (typeof list_status === 'undefined' || list_status === '') {
      errors.list_status = "List status not informed correctly";
      paramError = true;
    }
    if (moment(list_date, "x").isBefore(moment())) {
      errors.list_date = "Match has to happen in the future";
      paramError = true;
    }
    if (paramError) {
      return res.json({
        "message": "Please check the following",
        "errors": errors,
        "errMessage": "Params have not been informed correctly"
      });
    }
    names = [];
    isParticipating = req.body.names;
    rowsAffected = 0;
    message = "";
    errMessage = "";
    if (isParticipating === 'true') {
      names = [
        {
          player_id: new ObjectId(req.user.id),
          datetime: 'date',
          last_name: req.user.facebook.last_name,
          first_name: req.user.facebook.first_name,
          full_name: req.user.facebook.first_name + "  " + req.user.facebook.last_name,
          phone: req.user.phone,
          status: 'playing'
        }
      ];
    }
    if (list_size > 0) {
      start = 0;
      if (isParticipating === 'true') {
        start = 1;
      }
      for (index = i = ref = start, ref1 = list_size - 1; ref <= ref1 ? i <= ref1 : i >= ref1; index = ref <= ref1 ? ++i : --i) {
        names[index] = "undefined";
      }
    }
    match = new List({
      list_date: list_date,
      list_size: list_size,
      names: names,
      list_status: list_status,
      date: Date.now(),
      url: uuid.v1()
    });
    match.save(function(err, match, numAffected) {
      if (err) {
        if (err.code === 11000) {
          errMessage = "Inform a free timeslot";
        } else {
          message = "error";
          errMessage = err.message;
        }
      }
      if (match && typeof err !== 'undefined') {
        message = "Match created successfully";
        errMessage = "";
      } else {
        message = "Match not created";
      }
      res.json({
        "message": message,
        "err": errMessage
      });
    });
  });
  app.post('/match/edit', isLoggedIn, function(req, res, next) {
    var list_date, list_id, list_size, list_status;
    // REVIEW send to view list size so we can show waiting list
    list_id = req.body.list_id;
    list_date = req.body.list_date;
    list_status = req.body.list_status;
    list_size = req.body.list_size;
    if (list_id === '' || list_status === '' || list_date === '' || list_size < 0) {
      return res.json({
        "message": "Please inform all params",
        "errMessage": "Params have not been informed correctly"
      });
    }
    List.update({
      '_id': list_id
    }, {
      '$set': {
        'list_size': list_size,
        'list_status': list_status,
        'list_date': list_date
      }
    }, function(err, data) {
      if (err) {
        res.json({
          "message": "Error",
          "errMessage": err.message
        });
        return;
      } else {
        if (data.nModified > 0) {
          return res.json({
            "message": "Updated successfully",
            "errMessage": ""
          });
        } else {
          return res.json({
            "message": "Updated unsuccessfully",
            "errMessage": ""
          });
        }
      }
    });
  });
};
