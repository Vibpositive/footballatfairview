// app/routes.js
var List       = require('../app/models/list');

module.exports = function(app, passport)
{
	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res)
	{
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
	});

	// TODO: Authentication
	app.get('/index', isLoggedIn, function(req, res)
	{
		// List.find({status : 'active'}, function (err, list)
		List.find({}, function (err, list)
		{
			if (err) return handleError(err);
			// render the page and pass in any flash data if it exists
			console.log(list);
			res.render('index.ejs', { message: req.flash('loginMessage'), lists: list, user:req.user});
		});
	});
		
	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res)
	{
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	app.get('/list/:listid', isLoggedIn, function(req, res)
	{
		List.find({}, function (err, list)
		{
			if (err) return handleError(err);
			// render the page and pass in any flash data if it exists
			console.log(list);
			//TODO: Keep Going from here 25/05/2016 17/04
			res.render('index.ejs', { message: req.flash('loginMessage'), lists: list, user:req.user});
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res)
	{
		req.logout();
		res.redirect('/');
	});

	// =====================================
	// FACEBOOK ROUTES =====================
	// =====================================
	// route for facebook authentication and login
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/index',
			failureRedirect : '/'
		}));

	// route for logging out
	app.get('/logout', function(req, res)
	{
		req.logout();
		res.redirect('/');
	});
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next)
{

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}