var List, ObjectId, Penalty, Q, User, UserPenalty, _, addMatchToUser, addPenaltyToUser, addUserToMatch, getTimeToMatch, isLoggedIn, moment, removeMatchFomUser, uuid;

List = require('../models/list');

User = require('../models/user');

moment = require('moment');

uuid = require('node-uuid');

_ = require("underscore");

Penalty = require('../models/penalty');

UserPenalty = require('../models/user_penalty');

ObjectId = require('mongodb').ObjectID;

Q = require('q');

isLoggedIn = function(req, res, next) {
  // TODO: remove return next()
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

removeMatchFomUser = function(user, match, next) {
  var deferred;
  deferred = Q.defer();
  User.findByIdAndUpdate({
    _id: ObjectId(user.player_id)
  }, {
    $pull: {
      'matches': match
    }
  }, {
    'new': true
  }, function(err, doc) {
    var errMessage;
    if (err) {
      errMessage = err.message;
    }
    return deferred.resolve(doc.matches.indexOf(match));
  });
  return deferred.promise;
};

getTimeToMatch = function(list) {
  var currentTime, diffMinutes, matchTime;
  currentTime = moment();
  matchTime = moment(list.list_date, "x");
  diffMinutes = matchTime.diff(currentTime, 'minutes');
  return diffMinutes;
};

addPenaltyToUser = function(user, match, next) {
  // TODO: implement Q
  return User.findByIdAndUpdate({
    _id: user.player_id,
    matches: {
      $in: [match]
    }
  }, {
    $inc: {
      penalties: 1
    }
  }, function(err, doc) {
    return void 0;
  });
};

addUserToMatch = function(list_id, user, req) {
  var deferred;
  // TODO: check size of players list
  deferred = Q.defer();
  List.update({
    '_id': list_id
  }, {
    $addToSet: {
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
  }, function(err, numAffected) {
    if (err) {
      deferred.resolve(err);
    }
    return deferred.resolve(numAffected);
  });
  return deferred.promise;
};

// f_removePenaltyFromUser = (list_id) ->
//   console.log "f_removePenaltyFromUser",f_removePenaltyFromUser
//   deferred = Q.defer()

//   List.aggregate {
//     $match: $and: [ { _id: ObjectId(list_id) } ] },
//       { $project: {
//         names: { $filter: {
//           input: '$names',
//           as: 'name',
//           cond: { $and: [
//             {$eq: ['$$name.player_id', ObjectId(player_id) ]}
//           ] }
//         }},
//         _id: 0
//       }} , (err, resultado) ->
//         if err
//           console.log err
//           deferred.resolve err
//         penalty_id = resultado[0].names[0].penalty_id
//         deferred.resolve penalty_id

//         UserPenalty.findByIdAndRemove _id: ObjectId(penalty_id),
//         (err, result) ->
//           # TODO: Validate result
//   return deferred.promise
module.exports = function(app) {
  app.get('/matches', isLoggedIn, function(req, res) {
    List.find({}, function(err, list) {
      if (err) {
        return console.log(err);
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
  app.post('/matches/views/playerslist', isLoggedIn, function(req, res) {
    List.findOne({
      _id: req.body.list_id
    }, function(err, list) {
      if (err) {
        res.send(err);
        return;
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
  app.post('/matches/participate', isLoggedIn, function(req, res) {
    var errMessage, inputFault, list_id, prop, updated, user;
    list_id = req.body.list_id;
    errMessage = "";
    user = {};
    updated = 0;
    inputFault = false;
    user.player_id = req.user ? new ObjectId(req.user.id) : new ObjectId(req.body.player_id);
    user.datetime = req.user ? 'date' : 'date';
    user.last_name = req.user ? req.user.facebook.last_name : req.body.last_name;
    user.first_name = req.user ? req.user.facebook.first_name : req.body.first_name;
    user.full_name = req.user ? req.user.facebook.first_name + " " + req.user.facebook.last_name : req.body.first_name + " " + req.body.last_name;
    user.phone = req.user ? req.user.phone : req.body.phone;
    for (prop in user) {
      if (user[prop] == null) {
        res.json({
          "message": "Please inform all params",
          "errMessage": "Params have not been informed correctly"
        });
        return;
      }
    }
    if (req.body.player_status === 'playing') {
      return List.findOne({
        _id: list_id,
        'names.player_id': user.player_id
      }, function(err, doc) {
        if (err) {
          errMessage = err.message;
        }
        if (!doc) {
          addUserToMatch(list_id, user).then(function(data) {
            res.json({
              "message": "Added to the match",
              "updated": data.nModified,
              "errMessage": errMessage
            });
            return void 0;
          });
          addMatchToUser(user, list_id).then(function(data) {
            // res.json {
            //   "message": "Success",
            //   "updated": data.nModified,
            //   "errMessage": errMessage
            // }
            return void 0;
          });
          return void 0;
        } else {
          res.json({
            "message": "Already on the match",
            "updated": 0,
            "errMessage": errMessage
          });
          return void 0;
        }
      });
    } else if (req.body.player_status === 'not playing') {
      return List.findOneAndUpdate({
        '_id': list_id
      }, {
        // "names.player_id": { $eq: user.player_id }
        $pull: {
          'names': {
            'player_id': user.player_id
          }
        }
      }, {
        'new': true
      }, function(err, list) {
        var penalty, timeToMatch;
        if (err) {
          errMessage = err.message;
        }
        if (list) {
          timeToMatch = getTimeToMatch(list);
          if (timeToMatch < 360) {
            penalty = true;
            addPenaltyToUser(user, list_id);
          }
          removeMatchFomUser(user, list_id);
          return res.json({
            "message": "",
            "list": list,
            "errMessage": errMessage
          });
        } else {
          return res.json({
            "message": "User is not in list",
            "updated": 0,
            "errMessage": ""
          });
        }
      });
    } else {
      res.json({
        "message": "Inform a valid status",
        "errMessage": "A valid status has not been informed"
      });
      return void 0;
    }
  });
  app.get('/matches/match/:list_id', isLoggedIn, function(req, res) {
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
        return res.render('matches/match_details.ejs', {
          message: req.flash('loginMessage'),
          list: list,
          match_date: moment(list.list_date, "x"),
          user: req.user,
          // TODO: remove option
          player_is_blocked: false,
          player_is_on_list: player_is_on_list ? true : false,
          moment: moment,
          disabled: list.list_status === 'deactivate' ? 'disabled' : '',
          title: "Match"
        });
      });
    });
  });
  app.post('/matches/match/details/:list_id', function(req, res) {
    var player_is_blocked;
    player_is_blocked = false;
    List.aggregate({
      $match: {
        $and: [
          {
            _id: ObjectId(list_id)
          }
        ]
      }
    }, {
      $project: {
        names: {
          $filter: {
            input: '$names',
            as: 'name',
            cond: {
              $and: [
                {
                  $eq: ['$$name.status',
                'blocked']
                },
                {
                  $eq: ['$$name.player_id',
                ObjectId(player_id)]
                }
              ]
            }
          }
        },
        _id: 0
      }
    }, function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result[0].names[0] !== void 0) {
        return player_is_blocked = true;
      }
    });
    return List.findOne({
      _id: ObjectId(list_id)
    }, function(err, result) {
      if (err) {
        console.log(err);
        res.send(err);
      }
      return res.send(result);
    });
  });
  app.get('/matches/match/details/:list_id', isLoggedIn, function(req, res) {
    List.findOne({
      _id: ObjectId(req.params.list_id)
    }, function(err, result) {
      if (err) {
        return console.log('err', err);
      }
      res.render('matches/match_list_details.ejs', {
        message: req.flash('loginMessage'),
        list: result,
        match_date: moment(result.list_date, 'x'),
        user: req.user,
        title: "Match: details"
      });
    });
  });
  app.get('/matches/create', isLoggedIn, function(req, res) {
    res.render('matches/create.ejs', {
      title: 'Create a match'
    });
  });
  app.get('/matches/edit', isLoggedIn, function(req, res) {
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
  app.get('/matches/edit/:list_id', isLoggedIn, function(req, res, next) {
    var list_id;
    list_id = req.params.list_id;
    List.findOne({
      _id: list_id
    }, {}, function(err, listFound) {
      if (err) {
        return {
          message: err
        };
      } else {
        res.render('matches/edit.ejs', {
          message: '',
          list: listFound,
          user: req.user,
          moment: moment,
          title: 'Matches List'
        });
      }
    });
  });
  // TODO: Improve route trying using just one
  app.post('/matches/edit/match', isLoggedIn, function(req, res, next) {
    var full_name, list_id, player_id, player_status;
    list_id = req.body.list_id;
    player_status = req.body.player_status;
    full_name = req.body.full_name;
    player_id = new ObjectId(req.body.player_id);
    if (player_status === "remove") {
      List.findByIdAndUpdate({
        '_id': list_id
      }, {
        $pull: {
          names: {
            full_name: full_name,
            player_id: new ObjectId(player_id)
          }
        }
      }, function(err, model) {
        if (err) {
          return res.status(422).json(err);
        }
        return List.findOne({
          _id: list_id,
          'names.full_name': full_name
        }, function(err2, model2) {
          if (err) {
            return res.status(422).json(err2);
          }
          res.status(200).json(model2);
        });
      });
      return;
    }
  });
  app.post('/matches/create', isLoggedIn, function(req, res, next) {
    var errMessage, isParticipating, list_date, list_size, list_status, match, message, names, rowsAffected;
    names = [];
    isParticipating = req.body.names;
    rowsAffected = 0;
    message = "";
    errMessage = "";
    list_date = req.body.list_date;
    list_size = req.body.list_size;
    list_status = req.body.list_status;
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
  app.post('/matches/update', isLoggedIn, function(req, res, next) {
    var list_date, list_id, list_size, list_status;
    list_id = req.body.list_id;
    list_date = req.body.list_date;
    list_status = req.body.list_status;
    list_size = req.body.list_size;
    if (list_id === '' || list_status === '' || list_date === '' || list_size < 0) {
      res.json({
        'message': 'wrong params'
      });
      return;
    }
    List.update({
      '_id': list_id
    }, {
      '$set': {
        'list_size': list_size,
        'list_status': list_status,
        'list_date': list_date
      }
    }, function(err, numAffected) {
      if (err) {
        res.json({
          message: err
        });
      } else {
        if (numAffected > 0) {
          res.json({
            message: 'ok'
          });
        } else {
          // res.json {
          //   "message": message,
          //   "err": errMessage
          // }
          res.json({
            message: String(numAffected) + ' rows affected'
          });
        }
      }
    });
  });
};

// res.json {
//   "message": message,
//   "err": errMessage
// }
// return
// return
