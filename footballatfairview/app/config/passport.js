var FacebookStrategy, User, configAuth, util;

FacebookStrategy = require('passport-facebook').Strategy;

User = require('../models/user');

configAuth = require('./auth');

util = require('util');

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  /*passport.use(new FacebookStrategy({
  
  	// pull in our app id and secret from our auth.js file
  	clientID        : configAuth.facebookAuth.clientID,
  	clientSecret    : configAuth.facebookAuth.clientSecret,
  	callbackURL     : configAuth.facebookAuth.callbackURL
  
  },
   */
  passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'emails', 'name', 'gender', 'picture.type(large)']
  }, function(token, refreshToken, profile, done) {
    process.nextTick(function() {
      User.findOne({
        'facebook.id': profile.id
      }, function(err, user) {
        var newUser;
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, user);
        } else {
          newUser = new User;
          newUser.facebook.id = profile.id;
          newUser.facebook.photos = profile.photos;
          newUser.facebook.token = token;
          newUser.facebook.full_name = profile._json.first_name + ' ' + profile._json.last_name;
          newUser.facebook.first_name = profile._json.first_name;
          newUser.facebook.last_name = profile._json.last_name;
          newUser.facebook.email = profile._json.email;
          newUser.status = 'active';
          newUser.save(function(err) {
            if (err) {
              throw err;
            }
            return done(null, newUser);
          });
        }
      });
    });
  }));
};
