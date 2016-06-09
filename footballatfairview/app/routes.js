var List, isLoggedIn, moment, uuid;

List = require('../app/models/list');

uuid = require('node-uuid');

moment = require('moment');

isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

module.exports = function(app, passport) {
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
    res.render('profile.ejs', {
      user: req.user
    });
  });
  app.get('/list/:listid', function(req, res) {
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
  app.get('/list/details/:listid', function(req, res) {
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
  app.post('/crud/list/create', function(req, res, next) {
    var errMessage, list_date, list_size, list_status, match, names;
    names = req.body.names;
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
  app.post('/crud/list/participate', function(req, res, next) {
    var datetime, first_name, full_name, last_name, list_id, player_id, status;
    player_id = req.user.facebook.id;
    datetime = 'moment().format("dddd, MMMM Do YYYY, h : mm : ss a")';
    last_name = req.user.facebook.last_name;
    first_name = req.user.facebook.first_name;
    full_name = req.user.facebook.first_name + " " + req.user.facebook.last_name;
    status = 'playing';
    list_id = req.body.list_id;
    if (req.body.player_status === 'true') {
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

          /*if err
              console.log err
              res.send 'err: ' + String(err)
          else
              if numAffected > 0
                  res.json({ message: 'ok' });
              else
                  res.json({ message: '0 rows affected' });
          return
           */
        }
      });
    }
  });
  app.get('/cp', function(req, res, next) {
    res.render('cp/index.ejs');
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
};
