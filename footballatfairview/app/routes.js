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
  app.get('/newindex', isLoggedIn, function(req, res) {
    return res.render('newindex.ejs');
  });
  app.get('/', function(req, res) {
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });
  app.get('/index', isLoggedIn, function(req, res) {
    req.user.admin = true;
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

  /*
  app.get '/cp', isLoggedIn, (req, res) ->
      res.render 'cp/index.ejs'
      return
      
  app.post '/cp/matchs/list', isLoggedIn, (req, res) ->
      List.find {}, (err, list) ->
          console.log list
          if err
              res.send err
              return
          res.render 'matchs/list.ejs', message: req.flash('loginMessage'), lists: list, user: req.user
          return
      return
   */
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
