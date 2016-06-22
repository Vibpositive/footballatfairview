var User, isLoggedIn;

User = require('../models/user');

isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

module.exports = function(app) {
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile/profile.ejs', {
      user: req.user,
      title: 'Profile'
    });
  });
  app.post('/profile/edit/phoneNumber', isLoggedIn, function(req, res) {
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
  return app.get('/profile/view/details', isLoggedIn, function(req, res) {
    res.render('profile/details.ejs', {
      message: req.flash('loginMessage'),
      user: req.user,
      title: 'Profile Details: ' + String(req.user.fullname)
    });
  });
};
