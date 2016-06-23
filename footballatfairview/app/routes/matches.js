var List, User, addMatchToUserList, isLoggedIn, moment, uuid;

List = require('../models/list');

User = require('../models/user');

moment = require('moment');

uuid = require('node-uuid');

isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

addMatchToUserList = function(user, match, operation, next) {
  if (operation === 'push') {
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
    return List.findOne({
      _id: req.body.list_id
    }, function(err, list) {
      console.log(list);
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
    var datetime, first_name, full_name, last_name, list_id, player_id;
    player_id = req.user.id;
    datetime = 'date';
    last_name = req.user.facebook.last_name;
    first_name = req.user.facebook.first_name;
    full_name = req.user.facebook.first_name + " " + req.user.facebook.last_name;
    list_id = req.body.list_id;
    if (req.body.player_status === 'true') {
      addMatchToUserList(req.user, list_id, 'push');
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
            status: 'playing'
          }
        }
      }, function(err, numAffected) {
        if (err) {
          return res.send('err: ' + String(err));
        } else {
          if (numAffected > 0) {
            return res.json({
              message: 'ok'
            });
          } else {
            res.json({
              message: '0 rows affected'
            });
          }
        }
      });
    } else {
      addMatchToUserList(req.user, list_id, 'pull');
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
          return res.send('err: ' + String(err));
        } else {
          return res.send(model);
        }
      });
    }
  });
  app.get('/matches/match/:listid', isLoggedIn, function(req, res) {
    var listid;
    listid = req.params.listid;
    List.find({
      '_id': listid,
      'names': {
        $elemMatch: {
          'full_name': req.user.facebook.full_name
        }
      }
    }, function(err, sec_res) {
      var player_on_list;
      player_on_list = sec_res.length <= 0 ? false : true;
      return List.findOne({
        _id: listid
      }, function(err, list) {
        if (err) {
          console.log(err);
          return;
        }
        res.render('matches/match_details.ejs', {
          message: req.flash('loginMessage'),
          list: list,
          match_date: moment(list.date).format("dddd, MMMM Do YYYY, h : mm : ss a"),
          user: req.user,
          player_on_list: player_on_list,
          moment: moment,
          disabled: list.list_status === 'deactivate' ? 'disabled' : '',
          title: "Match"
        });
      });
    });
  });
  app.get('/matches/match/details/:listid', isLoggedIn, function(req, res) {
    List.findOne({
      _id: req.params.listid
    }, function(err, list) {
      if (err) {
        console.log(err);
        return;
      }
      res.render('matches/match_list_details.ejs', {
        message: req.flash('loginMessage'),
        list: list,
        match_date: moment(list.date).format("dddd, MMMM Do YYYY, h : mm : ss a"),
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
      console.log(list);
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
  app.get('/matches/edit/:listid', isLoggedIn, function(req, res, next) {
    var listid;
    listid = req.params.listid;
    return List.findOne({
      _id: listid
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
  app.post('/matches/edit/status', isLoggedIn, function(req, res, next) {
    var list_id, list_status;
    list_id = req.body.list_id;
    list_status = req.body.list_status;
    return List.update({
      _id: list_id
    }, {
      'list_status': String(list_status)
    }, function(err, numAffected) {
      if (err) {
        return {
          message: err
        };
      } else {
        if (numAffected > 0) {
          res.send({
            message: 'ok'
          });
        } else {
          res.send({
            message: '0 rows affected'
          });
        }
      }
    });
  });
  app.post('/matches/edit/match', isLoggedIn, function(req, res, next) {
    var list_id, player_id, player_status;
    list_id = req.body.list_id;
    player_status = req.body.player_status;
    player_id = req.body.player_id;
    return List.update({
      '_id': list_id,
      "names.player_id": player_id
    }, {
      '$set': {
        'names.$.status': player_status
      }
    }, function(err, numAffected) {
      if (err) {
        return res.send('err: ' + String(err));
      } else {
        if (numAffected > 0) {
          return res.json({
            message: 'ok'
          });
        } else {
          res.json({
            message: '0 rows affected'
          });
        }
      }
    });
  });
  app.post('/matches/create', isLoggedIn, function(req, res, next) {
    var errMessage, isParticipating, list_date, list_size, list_status, match, names;
    isParticipating = req.body.names;
    if (isParticipating === 'true') {
      names = [
        {
          player_id: req.user.id,
          datetime: 'date',
          last_name: req.user.facebook.last_name,
          first_name: req.user.facebook.first_name,
          full_name: req.user.facebook.first_name + " " + req.user.facebook.last_name,
          status: 'playing'
        }
      ];
    } else {
      names = [];
    }
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
    return match.save(function(err, result, numAffected) {
      var util;
      util = require('util');
      if (err) {
        console.log(err);
        if (typeof err === 'object') {
          res.json({
            message: 'Object already exists'
          });
        } else {
          res.json({
            message: err
          });
        }
      } else {
        if (numAffected > 0) {
          return res.json({
            message: 'ok'
          });
        } else {
          res.json({
            message: String(numAffected) + ' rows affected'
          });
        }
      }
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
          return res.json({
            message: 'ok'
          });
        } else {
          res.json({
            message: String(numAffected) + ' rows affected'
          });
        }
      }
    });
  });
};
