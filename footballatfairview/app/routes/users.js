var List, User, _, isLoggedIn, moment;

User = require('../models/user');

List = require('../models/list');

_ = require('underscore');

moment = require('moment');

isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

module.exports = function(app) {
  app.get('/users', isLoggedIn, function(req, res) {
    return User.find({}, function(err, list) {
      res.render('users/index.ejs', {
        list: list,
        user: req.user,
        users: list,
        title: 'users'
      });
    });
  });
  app.post('/users', function(req, res) {
    User.find({}, function(err, list) {
      return res.json(list);
    });
  });
  app.get('/user/view/:user_id', function(req, res) {
    var user_id;
    user_id = req.params.user_id;
    return User.findOne({
      _id: user_id
    }, function(err, userResultes_query) {
      return List.find({
        list_status: 'active'
      }, function(l_err, listResultes_query) {
        var isUserInTheList, userActiveLists;
        userActiveLists = [];
        isUserInTheList = false;
        _.each(userResultes_query.matches, function(userList) {
          _.each(listResultes_query, function(list) {
            _.find(list.names, function(list_) {
              isUserInTheList = String(list_.player_id) === String(userResultes_query._id);
              return isUserInTheList;
            });
            if (String(userList) === String(list._id) && isUserInTheList === true) {
              userActiveLists.push(list);
            }
          });
        });
        res.render('users/view.ejs', {
          user_found: userResultes_query,
          user_lists: userActiveLists,
          title: 'users',
          moment: moment
        });
      });
    });
  });
  app.get('/user/edit/:user_id', function(req, res) {
    var user_id;
    user_id = req.params.user_id;
    User.findOne({
      _id: user_id
    }, function(err, userResultes_query) {
      List.find({
        list_status: 'active'
      }, function(l_err, listResultes_query) {
        var isUserInTheList, userActiveLists;
        userActiveLists = [];
        isUserInTheList = false;
        _.each(userResultes_query.matches, function(userList) {
          _.each(listResultes_query, function(list) {
            _.find(list.names, function(list_) {
              isUserInTheList = String(list_.player_id) === String(userResultes_query._id);
              return isUserInTheList;
            });
            if (String(userList) === String(list._id) && isUserInTheList === true) {
              userActiveLists.push(list);
            }
          });
        });
        res.render('users/edit.ejs', {
          user_found: userResultes_query,
          user_lists: userActiveLists,
          title: 'users',
          moment: moment
        });
      });
    });
  });
  app.post('/user/edit/:user_id', function(req, res) {
    return res.send('ok');
  });
};
