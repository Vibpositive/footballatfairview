var List, ObjectId, Penalty, User, UserPenalty, _, addMatchToUserList, addPenaltyToUser, isLoggedIn, moment, uuid;

List = require('../models/list');

User = require('../models/user');

moment = require('moment');

uuid = require('node-uuid');

_ = require("underscore");

Penalty = require('../models/penalty');

UserPenalty = require('../models/user_penalty');

ObjectId = require('mongodb').ObjectID;

isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

addMatchToUserList = function(user, match, operation, next) {
  if (operation === true) {
    return User.update({
      _id: user.id
    }, {
      $addToSet: {
        'matches': match
      }
    }, function(err, numAffected) {
      if (err) {
        return {
          message: err
        };
      } else {
        if (numAffected > 0) {
          return {
            message: 'ok'
          };
        } else {
          return {
            message: '0 rows affected'
          };
        }
      }
    });
  } else {
    return User.findByIdAndUpdate({
      _id: user.id
    }, {
      $pull: {
        'matches': match
      }
    }, function(err, numAffected) {
      if (err) {
        return {
          message: err
        };
      } else {
        return {
          message: numAffected
        };
      }
    });
  }
};

addPenaltyToUser = function(user, match, operation, next) {};

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
  app.post('/matches/addusertomatch', function(req, res) {
    var list_id;
    list_id = req.body.list_id;
    return User.find({}, function(err, result) {
      return _.each(result, function(item) {
        List.update({
          '_id': list_id
        }, {
          $addToSet: {
            'names': {
              player_id: item._id,
              datetime: "",
              last_name: item.facebook.last_name,
              first_name: item.facebook.first_name,
              full_name: item.facebook.full_name,
              phone: item.phone,
              status: 'playing'
            }
          }
        }, function(err, numAffected) {});
        return;
        return res.send("ok");
      });
    });
  });
  app.post('/matches/participate', isLoggedIn, function(req, res) {
    var datetime, first_name, full_name, isUserBlocked, last_name, list_id, phone, player_id, updateList;
    player_id = new ObjectId(req.user.id);
    datetime = 'date';
    last_name = req.user.facebook.last_name;
    first_name = req.user.facebook.first_name;
    full_name = req.user.facebook.first_name + " " + req.user.facebook.last_name;
    list_id = req.body.list_id;
    phone = req.user.phone;
    isUserBlocked = false;
    updateList = false;
    if (req.body.player_status === 'true') {
      return List.findOne({
        _id: list_id,
        'names.player_id': player_id
      }, function(err, doc) {
        var update;
        if (err) {
          console.log(err);
          return err;
        }
        if (!doc) {
          updateList = true;
        } else {
          _.each(doc.names, function(item) {
            if (String(item.player_id) === String(req.user.id)) {
              if (String(item.status) === String("blocked")) {
                isUserBlocked = true;
                console.log("setting user as blocked");
              } else {
                return updateList = true;
              }
            }
          });
        }
        if (!isUserBlocked && updateList === true) {
          console.log("updating user");
          update = {
            $set: {
              names: [
                {
                  player_id: player_id
                }, {
                  datetime: datetime,
                  last_name: last_name,
                  first_name: first_name,
                  full_name: full_name,
                  status: 'playing',
                  phone: phone
                }
              ]
            }
          };
          List.update({
            '_id': list_id,
            'names': {
              $elemMatch: {
                'status': "blocked"
              }
            }
          }, {
            '$set': {
              "names.$.player_id": player_id,
              "names.$.datetime": datetime,
              "names.$.last_name": last_name,
              "names.$.first_name": first_name,
              "names.$.full_name": full_name,
              "names.$.phone": phone,
              "names.$.status": "playing"
            }
          }, function(err, numAffected) {
            if (err) {
              console.log(err);
              return res.send(err);
            }
            if (numAffected !== 1) {
              return List.update({
                '_id': list_id
              }, {
                $addToSet: {
                  'names': {
                    player_id: player_id,
                    datetime: datetime,
                    last_name: last_name,
                    first_name: first_name,
                    full_name: full_name,
                    status: "playing",
                    phone: phone
                  }
                }
              }, function(err, numAffected) {
                if (err) {
                  res.send('err: ' + String(err));
                }
                res.send("ok");
              });
            } else {

              /*User.update {
                #_id : req.user.id
              },{
                $pull : {
                  #'penalties' : newUserPenalty._id
                }
              },(err, numAffected) ->
                console.log "numAffected",numAffected
               */
              List.update({
                _id: list_id,
                'names': {
                  $elemMatch: {
                    'player_id': player_id
                  }
                }
              }, {
                $unset: {
                  'names.$.penalty_id': true
                }
              }, function(err, result) {
                if (err) {
                  return console.log(err);
                }
              });
              return res.send("ok");
            }
          });
          return addMatchToUserList(req.user, list_id, true);
        }
      });
    } else {
      return List.findOne({
        '_id': list_id
      }, function(err, list) {
        var currentTime, diffMinutes, is_user_on_waiting_list, matchTime, user_index;
        currentTime = moment();
        matchTime = moment(list.list_date, "x");
        diffMinutes = currentTime.diff(matchTime, 'minutes');
        user_index = 9999;
        is_user_on_waiting_list = false;
        if (diffMinutes > -360) {
          return List.findOne({
            '_id': list_id,
            'names': {
              $elemMatch: {
                'player_id': player_id
              }
            }
          }, function(err, userFound) {
            var is_there_waiting_list, users_playing;
            if (err) {
              console.log(err);
              return res.send(err);
            }
            users_playing = userFound.names.length;
            is_there_waiting_list = users_playing >= list.list_size ? true : false;
            console.log("is_there_waiting_list", is_there_waiting_list);
            console.log("users_playing", users_playing);
            console.log("list.list_size", list.list_size);
            _.each(userFound.names, function(val, i) {
              if (String(val.player_id) === String(req.user.id)) {
                user_index = i;
                if (user_index > list.list_size) {
                  return is_user_on_waiting_list = true;
                }
              }
            });
            if (is_there_waiting_list === false || is_user_on_waiting_list === true) {
              List.findByIdAndUpdate({
                '_id': list_id
              }, {
                $pull: {
                  'names': {
                    'player_id': player_id
                  }
                }
              }, function(err, model) {
                return res.send("ok");
              });
              return addMatchToUserList(req.user, list_id, false);
            } else {
              Penalty.findOne({
                description: "Player removed name from list less than 6 hours before match starting"
              }, function(penalty_err, penalty_list) {
                var newUserPenalty;
                if (penalty_err) {
                  return res.status(422).json(penalty_err);
                }
                newUserPenalty = new UserPenalty({
                  player_id: req.user.id,
                  penalty_id: penalty_list.id,
                  match_id: list_id
                });
                return newUserPenalty.save(function(err, result, numAffected) {
                  if (err) {
                    return res.status(422).json(err);
                  }
                  console.log(newUserPenalty._id);
                  User.update({
                    _id: req.user.id
                  }, {
                    $addToSet: {
                      'penalties': newUserPenalty._id
                    }
                  }, function(err, numAffected) {
                    return console.log("numAffected", numAffected);
                  });
                  return List.update({
                    '_id': list_id,
                    'names': {
                      $elemMatch: {
                        'player_id': player_id
                      }
                    }
                  }, {
                    '$set': {
                      "names.$.datetime": "",
                      "names.$.last_name": "available",
                      "names.$.first_name": "Position",
                      "names.$.full_name": "",
                      "names.$.phone": "",
                      "names.$.status": "blocked",
                      "names.$.penalty_id": newUserPenalty._id
                    }
                  }, function(err, numAffected) {
                    console.log("user_index", user_index, "list.list_size", list.list_size);
                    console.log("is_user_on_waiting_list", String(is_user_on_waiting_list));
                    if (err) {
                      res.json({
                        message: err
                      });
                      return;
                    }
                    return res.send("ok");
                  });
                });
              });
              return addMatchToUserList(req.user, list_id, false);
            }
          });
        } else {
          addMatchToUserList(req.user, list_id, false);
          return List.findByIdAndUpdate({
            '_id': list_id
          }, {
            $pull: {
              'names': {
                full_name: full_name
              }
            }
          }, function(err, model) {
            if (err) {
              res.send('err: ' + String(err));
              return;
            } else {
              res.send(model);
              return;
            }
          });
        }
      });
    }
  });
  app.get('/matches/match/:list_id', isLoggedIn, function(req, res) {
    var list_id, player_id, player_is_blocked, player_is_on_list;
    list_id = req.params.list_id;
    player_id = req.user._id;
    player_is_blocked = false;
    player_is_on_list = false;
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
                  $eq: ['$$name.status', 'blocked']
                }, {
                  $eq: ['$$name.player_id', ObjectId(player_id)]
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
      console.log(result);
      if (result[0].names[0] !== void 0) {
        return player_is_blocked = true;
      }
    });

    /*List.find
      '_id'   : list_id,
      'names' : $elemMatch : 'player_id' : player_id, (err, sec_res) ->
     */
    List.find({
      '_id': list_id,
      'names': {
        $elemMatch: {
          'player_id': ObjectId(req.user.id)
        }
      }
    }, function(err, userFound) {
      console.log(userFound);
      player_is_on_list = userFound.length <= 0 ? false : true;

      /*List.aggregate(
          { $match   : $and: [ 
                {
                  _id : ObjectId(list_id)
                }
              ]
          },
          { $project : {
              names: { $filter: {
                  input: '$names',
                  as: 'name',
                  cond: {$eq: ['$$name.status', 'playing']}
              }},
              _id: 1, list_date   : 1, list_status :1,list_size :1
          }}
      ,
       */
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
          match_date: moment(list.list_date).format("dddd, MMMM Do YYYY, h             : mm : ss a"),
          user: req.user,
          player_is_blocked: player_is_blocked,
          player_is_on_list: player_is_on_list,
          moment: moment,
          disabled: list.list_status === 'deactivate' ? 'disabled' : '',
          title: "Match"

          /*message           : req.flash('loginMessage')
          list              : list[0]
          match_date        : moment(list[0].date).format("dddd, MMMM Do YYYY, h             : mm : ss a");
          user              : req.user
          player_is_blocked : player_is_blocked
          player_is_on_list : player_is_on_list
          moment            : moment
          disabled          : if list[0].list_status == 'deactivate' then 'disabled' else ''
          title             : "Match"
           */
        });
      });
    });
  });
  app.post('/matches/match/details/:list_id', function(req, res) {

    /*current_list_length = 0
    
    List.aggregate(
        { $match   : $and: [ 
              {
                _id : ObjectId(list_id)
              }
            ]
        },
        { $project: { count: { $size:"$names" }}}, (err, result)->
            current_list_length = result[0].count
            console.log "current_list_length",current_list_length
    )
     */
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
                  $eq: ['$$name.status', 'blocked']
                }, {
                  $eq: ['$$name.player_id', ObjectId(player_id)]
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

    /*List.aggregate(
        { $match   : $and: [ 
              {
                _id : ObjectId(list_id)
              }
            ]
        },
        { $project : {
            names: { $filter: {
                input: '$names',
                as: 'name',
                cond: {$eq: ['$$name.status', 'playing']}
            }},
            _id: 1, list_date   : 1, list_status :1,list_size :1,
        }}
     */
    return List.findOne({
      _id: ObjectId(list_id)
    }, function(err, result) {
      if (err) {
        console.log(err);
        res.send(err);
      }
      console.log(result);
      return res.send(result);
    });
  });
  app.get('/matches/match/details/:list_id', isLoggedIn, function(req, res) {

    /*List.aggregate [
      { $match: _id: ObjectId(req.params.list_id) }
      { $project:
        names: $filter:
          input: '$names'
          as: 'names'
          cond: $eq: [
            '$$names.status'
            'playing'
          ]
        _id: 0, list_date:1, list_status:1, list_size : 1 }
    ]
     */
    List.findOne({
      _id: ObjectId(req.params.list_id)
    }, function(err, result) {
      if (err) {
        return console.log('err', err);
      }
      console.log(result);
      res.render('matches/match_list_details.ejs', {
        message: req.flash('loginMessage'),
        list: result,
        match_date: moment(result.list_date).format("dddd, MMMM Do YYYY, h : mm : ss a"),
        user: req.user,
        title: "Match: details"

        /*console.log result[0]
        res.render 'matches/match_list_details.ejs',
        message    : req.flash('loginMessage')
        list       : result[0]
        match_date : moment(result[0].list_date).format("dddd, MMMM Do YYYY, h : mm : ss a");
        user       : req.user
        title      : "Match: details"
         */
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
    return List.findOne({
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
  app.post('/matches/edit/match', function(req, res, next) {
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
    var errMessage, isParticipating, list_date, list_size, list_status, match, names;
    isParticipating = req.body.names;
    if (isParticipating === 'true') {
      names = [
        {
          player_id: new ObjectId(req.user.id),
          datetime: 'date',
          last_name: req.user.facebook.last_name,
          first_name: req.user.facebook.first_name,
          full_name: req.user.facebook.first_name + " " + req.user.facebook.last_name,
          phone: req.user.phone,
          status: 'playing'
        }
      ];
    } else {
      names = [];
      list_date = req.body.list_date;
      list_size = req.body.list_size;
      list_status = req.body.list_status;
      errMessage = '';
      match = new List({
        list_date: list_date,
        list_size: list_size,
        names: names,
        list_status: list_status,
        date: Date.now(),
        url: uuid.v1()
      });
      console.log('saving a new match');
      match.save(function(err, result, numAffected) {
        var util;
        util = require('util');
        if (err) {
          console.log(err);
          res.json({
            message: err
          });
        }
        return res.json({
          message: String(numAffected) + ' rows affected'
        });
      });
    }
    return res.send("nothing received");
  });
  return app.post('/matches/update', isLoggedIn, function(req, res, next) {
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
    return List.update({
      '_id': list_id
    }, {
      '$set': {
        'list_size': list_size,
        'list_status': list_status,
        'list_date': list_date
      }
    }, function(err, numAffected) {
      if (err) {
        return res.json({
          message: err
        });
      } else {
        if (numAffected > 0) {
          res.json({
            message: 'ok'
          });
        } else {
          res.json({
            message: String(numAffected) + ' rows affected'
          });
          return;
        }
      }
    });
  });
};
