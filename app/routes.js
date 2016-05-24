// app/routes.js
module.exports = function(app, passport)
{

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res)
    {
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    app.get('/index', function(req, res)
    {
        // render the page and pass in any flash data if it exists
        res.render('index.ejs', { message: req.flash('loginMessage') }); 
    });

    app.get('/second', function(req, res)
    {
        // render the page and pass in any flash data if it exists
        res.render('second.ejs', { message: req.flash('loginMessage') });
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

    app.get('/lists', isLoggedIn, function(req, res)
    {
        res.render('lists.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    app.post('/list', function(req, res)
    {
        res.send('ok')
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