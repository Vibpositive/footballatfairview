var List, User, express, isLoggedIn, router;

express = require('express');

router = express.Router();

List = require('../models/list');

User = require('../models/user');

isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

router.get('/', isLoggedIn, function(req, res) {
  res.render('cp/index.ejs', {
    title: 'Control Panel'
  });
});

router.post('/matchs/list', isLoggedIn, function(req, res) {
  List.find({}, function(err, list) {
    console.log(list);
    if (err) {
      res.send(err);
      return;
    }
    res.render('matchs/list.ejs', {
      message: req.flash('loginMessage'),
      lists: list,
      user: req.user,
      title: "Matches Lists"
    });
  });
});

module.exports = router;
