'use strict';
var app, bodyParser, cookieParser, express, flash, mongoose, morgan, notAuthenticated, notAuthorized, passport, port, session;

express = require('express');

app = express();

port = process.env.PORT || 8080;

mongoose = require('mongoose');

passport = require('passport');

flash = require('connect-flash');

morgan = require('morgan');

cookieParser = require('cookie-parser');

bodyParser = require('body-parser');

session = require('express-session');

mongoose.connect('mongodb://localhost/myapp');

// return mongoose.connect(url, options, function(err) {
//   if (err) {
//       logger.error('MongoDB connection error: ' + err);
//       // return reject(err);
//       process.exit(1);
//   }
// })

// TODO: keep information about adding and removing name from lists in a
// different db

// TODO implement MVC from
//   https://github.com/tutsplus/build-complete-website-expressjs

// app.use (error, req, res, next) ->
//   res.status 400
//   res.render 'errors/404.ejs',
//       title: '404'
//       error: error
//   return
if (process.env.NODE_ENV === 'development') {
  app.use(errorhandler({
    log: errorNotification
  }));
}

require('./app/config/passport')(passport);

notAuthenticated = {
  flashType: 'error',
  message: 'The entered credentials are incorrect',
  redirect: '/'
};

notAuthorized = {
  flashType: 'error',
  message: 'You have no access to this',
  redirect: '/index'
};

app.set('permission', {
  role: 'role',
  notAuthenticated: notAuthenticated,
  notAuthorized: notAuthorized
});

app.use(morgan('dev'));

app.use(cookieParser());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));

// parse application/json
app.use(bodyParser.json());

// app.use './build/public', express.static 'public'
app.use('/public', express.static(__dirname + '/public'));

// console.log __dirname + '/build/public'
// app.use('/', express.static(__dirname + '/public'))
app.set('view engine', 'ejs');

app.set('views', './build/views');

app.use(session({
  secret: 'shalalalalalalalalon',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());

app.use(passport.session());

app.use(flash());

require('./app/routes.js')(app, passport);

require('./app/routes/matches.js')(app);

require('./app/routes/profile.js')(app);

require('./app/routes/controlpanel.js')(app);

require('./app/routes/users.js')(app);

require('./app/routes/penalties.js')(app);

app.listen(port);

console.log('The magic happens on port ' + port);

process.on('exit', function(code) {
  return console.log('About to exit with code: ${code}');
});


// app.use (error, req, res, next) ->
//   res.status 404
//   res.render 'errors/404.ejs',
//     title: '404  : Not found'
//     error: error
//   return

// app.use (error, req, res, next) ->
//   res.status 500
//   res.render 'errors/500.ejs',
//     title: '500  : Internal Server Error'
//     error: error
//   return
