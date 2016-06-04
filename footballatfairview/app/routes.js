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
        return handleError(err);
      }
      console.log(list);
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
      id: req.param.listid
    }, function(err, list) {
      if (err) {
        return handleError(err);
      }
      console.log(list);
      res.render('lists/list.ejs', {
        message: req.flash('loginMessage'),
        list: list,
        user: req.user
      });
    });
  });
  app.get('/crud/list/create', function(req, res) {
    var match;
    match = new List({
      list_date: "",
      list_size: "",
      names: "",
      list_status: "",
      date: ""
    });
    return match.save(function(err) {
      if (err) {
        res.send('notok');
        return handleError(err);
      }
      res.send(match._id);
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
