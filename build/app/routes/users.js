var List, User, _, callback, isLoggedIn, moment;

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

callback = function(err, numAffected) {
  if (err) {
    return err;
  } else {
    return numAffected;
  }
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
    var user_email, user_id, user_name, user_phone;
    user_id = req.params.user_id;
    user_name = req.body.name;
    user_phone = req.body.phone;
    user_email = req.body.email;
    // TODO add option to change profile
    // ENUM of profiles
    // player, preferential, organizer, admin, master
    if (user_name !== "" && user_phone !== "" && user_email !== "") {
      return User.findOne({
        _id: user_id
      }, function(err, user) {
        console.log(user);
        user.phone = user_phone;
        user.facebook.email = user_email;
        user.facebook.full_name = user_name;
        user.save(callback);
        user.save(function(err) {
          if (err) {
            console.log(err);
            res.json({
              message: err
            });
            return;
          }
          return res.json({
            message: "ok"
          });
        });
      });
    } else {
      return res.json({
        message: "fill in all fields"
      });
    }
  });
};
