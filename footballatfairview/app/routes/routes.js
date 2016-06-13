var List, User, _, addMatchToUserList, errorNotification, errorhandler, isLoggedIn, isProfileComplete, moment, nonSecurePaths, notifier, uuid;

List = require('../app/models/list');

User = require('../app/models/user');

errorhandler = require('errorhandler');

uuid = require('node-uuid');

moment = require('moment');

notifier = require('node-notifier');

_ = require('underscore');

process.env.NODE_ENV = 'development';

nonSecurePaths = ['/', '/profile', '/auth/facebook', '/auth/facebook/callback', '/profile/crud/phoneNumber', '/profile/crud/details', '/cp/matchs'];

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
        'matchs': match
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
        'matchs': match
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

isProfileComplete = function(req) {};

errorNotification = function(err, str, req) {
  var title;
  title = 'Error in ' + req.method + ' ' + req.url;
  notifier.notify;
  return {
    title: title,
    message: str
  };
};

module.exports = function(app, passport) {
  app.use(function(req, res, next) {
    var err, error1;
    if (_.contains(nonSecurePaths, req.path)) {
      return next();
    }
    try {
      if (req.user.id) {
        return User.findOne({
          _id: req.user.id
        }, function(err, userResult) {
          if (err) {
            console.log(err);
            return false;
          }
          if (userResult.phone === '000-000-0000') {
            return res.redirect('/profile');
          } else {
            return next();
          }
        });
      }
    } catch (error1) {
      err = error1;
      return next();
    }
  });
  app.get('/newindex', isLoggedIn, function(req, res) {
    return res.render('newindex.ejs');
  });
  app.get('/', function(req, res) {
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });
  app.get('/index', isLoggedIn, function(req, res) {
    List.find({}, function(err, list) {
      if (err) {
        return console.log(err);
      }
      res.render('index.ejs', {
        message: req.flash('loginMessage'),
        lists: list,
        user: req.user
      });
    });
  });
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile/profile.ejs', {
      user: req.user
    });
  });
  app.post('/profile/crud/phoneNumber', function(req, res) {
    var phoneNumber, userId;
    phoneNumber = req.body.phoneNumber;
    userId = req.user.id;
    return User.update({
      _id: userId
    }, {
      'phone': phoneNumber
    }, function(err, numAffected) {
      if (err) {
        return {
          message: err
        };
      } else {
        if (numAffected > 0) {
          return res.send({
            message: 'ok'
          });
        } else {
          return res.send({
            message: '0 rows affected'
          });
        }
      }
    });
  });
  app.get('/profile/crud/details', function(req, res) {
    res.render('profile/details.ejs', {
      message: req.flash('loginMessage'),
      user: req.user
    });
  });
  app.post('/match/crud/deactivate', function(req, res) {
    res.send('ok');
  });
  app.get('/list/:listid', isLoggedIn, function(req, res) {
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
        res.render('lists/list.ejs', {
          message: req.flash('loginMessage'),
          list: list,
          match_date: moment(list.date).format("dddd, MMMM Do YYYY, h : mm : ss a"),
          user: req.user,
          player_on_list: player_on_list
        });
      });
    });
  });
  app.get('/list/details/:listid', isLoggedIn, function(req, res) {
    List.findOne({
      _id: req.params.listid
    }, function(err, list) {
      if (err) {
        console.log(err);
        return;
      }
      res.render('lists/list_details.ejs', {
        message: req.flash('loginMessage'),
        list: list,
        match_date: moment(list.date).format("dddd, MMMM Do YYYY, h : mm : ss a"),
        user: req.user
      });
    });
  });
  app.post('/crud/list/create', isLoggedIn, function(req, res, next) {
    var errMessage, isParticipating, list_date, list_size, list_status, match, names;
    isParticipating = req.body.names;
    if (isParticipating === 'true') {
      names = [
        {
          player_id: req.user.facebook.id,
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
    return match.save(function(err) {
      var errName;
      if (err) {
        for (errName in err.errors) {
          errMessage += err.errors[errName].message;
        }
        res.send(errMessage);
      } else {
        res.send(match._id);
      }
    });
  });
  app.post('/crud/list/participate', isLoggedIn, function(req, res, next) {
    var datetime, first_name, full_name, last_name, list_id, player_id, status;
    player_id = req.user.facebook.id;
    datetime = 'date';
    last_name = req.user.facebook.last_name;
    first_name = req.user.facebook.first_name;
    full_name = req.user.facebook.first_name + " " + req.user.facebook.last_name;
    status = 'playing';
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
            status: status
          }
        }
      }, function(err, numAffected) {
        if (err) {
          res.send('err: ' + String(err));
        } else {
          if (numAffected > 0) {
            res.json({
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
  app.get('/cp', isLoggedIn, function(req, res) {
    res.render('cp/index.ejs');
  });
  app.post('/cp/matchs', isLoggedIn, function(req, res) {
    res.render('matchs/index.ejs');
  });
  app.post('/cp/matchs/list', isLoggedIn, function(req, res) {
    List.find({}, function(err, list) {
      console.log(list);
      if (err) {
        res.send(err);
        return;
      }
      res.render('matchs/list.ejs', {
        message: req.flash('loginMessage'),
        lists: list,
        user: req.user
      });
    });
  });
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: 'email'
  }));
  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/index',
    failureRedirect: '/'
  }));
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
  app.use(function(req, res) {
    res.status(400);
    res.render('errors/404.ejs', {
      title: '404: File Not Found'
    });
  });
  app.use(function(error, req, res, next) {
    res.status(500);
    res.render('errors/500.ejs', {
      title: '500: Internal Server Error',
      error: error
    });
  });
  if (process.env.NODE_ENV === 'development') {
    app.use(errorhandler({
      log: errorNotification
    }));
  }
};
