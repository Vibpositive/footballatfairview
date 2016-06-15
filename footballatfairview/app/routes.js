var List, User, _, errorNotification, errorhandler, isLoggedIn, moment, nonSecurePaths, notifier, uuid;

List = require('../app/models/list');

User = require('../app/models/user');

errorhandler = require('errorhandler');

uuid = require('node-uuid');

moment = require('moment');

notifier = require('node-notifier');

_ = require('underscore');

process.env.NODE_ENV = 'development';

nonSecurePaths = ['/', '/profile', '/auth/facebook', '/auth/facebook/callback', '/profile/edit/phoneNumber', '/profile/crud/details', '/cp/matchs'];

isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

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
  var notAuthenticated;
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
  notAuthenticated = {
    flashType: 'error',
    message: 'The entered credentials are incorrect',
    redirect: '/login'
  };
  app.get('/newindex', function(req, res) {
    return res.render('newindex.ejs', {
      title: 'newindex'
    });
  });
  app.get('/', function(req, res) {
    req.session.userId = 'Vibpositive';
    res.render('login.ejs', {
      message: req.flash('loginMessage'),
      title: "Login page"
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
        user: req.user,
        moment: moment,
        title: 'Matches List'
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
  app.use(function(error, req, res, next) {
    res.status(400);
    res.render('errors/404.ejs', {
      title: '404',
      error: error
    });
    return;
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
