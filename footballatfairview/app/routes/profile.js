var User, express, isLoggedIn, router;

express = require('express');

router = express.Router();

User = require('../models/user');

isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

router.get('/', isLoggedIn, function(req, res) {
  res.render('profile/profile.ejs', {
    user: req.user,
    title: 'Profile'
  });
});

router.post('/edit/phoneNumber', function(req, res) {
  var phoneNumber, userId;
  phoneNumber = req.body.phoneNumber;
  userId = req.user.id;
  return User.update({
    _id: userId
  }, {
    'phone': phoneNumber
  }, function(err, numAffected) {
    if (err) {
      return {
        message: err
      };
    } else {
      if (numAffected > 0) {
        return res.send({
          message: 'ok'
        });
      } else {
        return res.send({
          message: '0 rows affected'
        });
      }
    }
  });
});

router.get('/view/details', function(req, res) {
  res.render('profile/details.ejs', {
    message: req.flash('loginMessage'),
    user: req.user,
    title: 'Profile Details: ' + String(req.user.fullname)
  });
});

module.exports = router;
