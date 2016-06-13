'use strict';
var app, bodyParser, configDB, cookieParser, express, flash, gabriel, matches, mongoose, morgan, passport, port, session;

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

configDB = require('./app/config/database.js');

gabriel = require('express-session');

matches = require('./app/routes/matches');

mongoose.connect(configDB.url);

require('./app/config/passport')(passport);

app.use(morgan('dev'));

app.use(cookieParser());

app.use(bodyParser());

app.use('/public', express["static"]('public'));

app.set('view engine', 'ejs');

app.use(session({
  secret: 'ilovescotchscotchyscotchscotch'
}));

app.use(passport.initialize());

app.use(passport.session());

app.use(flash());

require('./app/routes.js')(app, passport);

app.use('/matches', matches);

app.listen(port);

console.log('The magic happens on port ' + port);
