var List, User, isLoggedIn;

List = require('../models/list');

User = require('../models/user');

isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

module.exports = function(app) {
  app.get('/controlpanel', isLoggedIn, function(req, res) {
    res.render('controlpanel/index.ejs', {
      title: 'Control Panel'
    });
  });
  return app.post('/controlpanel/matches/list', isLoggedIn, function(req, res) {
    List.find({}, function(err, list) {
      console.log(list);
      if (err) {
        res.send(err);
        return;
      }
      res.render('matches/list.ejs', {
        message: req.flash('loginMessage'),
        lists: list,
        user: req.user,
        title: "Matches Lists"
      });
    });
  });
};
