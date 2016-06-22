var User, isLoggedIn;

User = require('../models/user');

isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

module.exports = function(app) {
  app.get('/user', isLoggedIn, function(req, res) {
    res.render('users/index.ejs', {
      user: req.user,
      title: 'users'
    });
  });
  return app.post('/users/nada', isLoggedIn, function(req, res) {
    User.find({}, function(err, list) {
      if (err) {
        return console.log(err);
      }
      res.send('matches/index.ejs');
    });
  });
};
