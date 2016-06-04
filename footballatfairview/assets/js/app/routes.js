var List, isLoggedIn;

List = require('../app/models/list');

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
  app.get('/list/:listid', isLoggedIn, function(req, res) {
    List.findOne({
      _id: req.params.listid
    }, function(err, list) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(list);
      res.render('lists/list.ejs', {
        message: req.flash('loginMessage'),
        list: list,
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
      date: Date.now()
    });
    return match.save(function(err) {
      var errName;
      if (err) {
        for (errName in err.errors) {
          console.log('err', err.errors[errName].message);
          errMessage += err.errors[errName].message;
        }
        res.send(errMessage);
      } else {
        console.log('match._id', match._id);
        res.send(match._id);
      }
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
};
