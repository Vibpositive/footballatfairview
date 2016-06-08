// config/passport.js

// load all the things we need
var FacebookStrategy = require('passport-facebook').Strategy;

// load up the user model
var User       = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {

	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	// used to deserialize the user
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	// =========================================================================
	// FACEBOOK ================================================================
	// =========================================================================
	/*passport.use(new FacebookStrategy({

		// pull in our app id and secret from our auth.js file
		clientID        : configAuth.facebookAuth.clientID,
		clientSecret    : configAuth.facebookAuth.clientSecret,
		callbackURL     : configAuth.facebookAuth.callbackURL

	},*/
	passport.use(new FacebookStrategy({
		clientID        : configAuth.facebookAuth.clientID,
		clientSecret    : configAuth.facebookAuth.clientSecret,
		callbackURL     : configAuth.facebookAuth.callbackURL,
		profileFields: ['id', 'emails', 'name'] //This
	},

	// facebook will send back the token and profile
	function(token, refreshToken, profile, done) {

		// asynchronous
		process.nextTick(function() {

			// find the user in the database based on their facebook id
			User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

				// if there is an error, stop everything and return that
				// ie an error connecting to the database
				if (err)
					return done(err);

				// if the user is found, then log them in
				if (user) {
					return done(null, user); // user found, return that user
				} else {
					// if there is no user found with that facebook id, create them
					var newUser            = new User();

					console.log(profile);
					
					// set all of the facebook information in our user model
					newUser.facebook.id         = profile.id; // set the users facebook id
					newUser.facebook.token      = token; // we will save the token that facebook provides to the user
					newUser.facebook.full_name  = profile._json.first_name + ' ' + profile._json.last_name; // look at the passport user profile to see how names are returned
					newUser.facebook.first_name = profile._json.first_name;
					newUser.facebook.last_name  = profile._json.last_name; // look at the passport user profile to see how names are returned
					newUser.facebook.email      = profile._json.email; // facebook can return multiple emails so we'll take the first
					
					// save our user to the database
					newUser.save(function(err) {
						if (err)
							throw err;

						// if successful, return the new user
						return done(null, newUser);
					});
				}

			});
		});

	}));

};