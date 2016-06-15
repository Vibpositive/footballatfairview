'use strict';
var acl, app, bodyParser, configDB, controlpanel, cookieParser, dbconnection, express, flash, gabriel, matches, mongoose, morgan, passport, port, profile, session;

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

acl = require('acl');

gabriel = require('express-session');

matches = require('./app/routes/matches');

profile = require('./app/routes/profile');

controlpanel = require('./app/routes/controlpanel');

mongoose.connect(configDB.url);

dbconnection = mongoose.connect(configDB.url, function(err) {
  if (err) {
    return console.log('MongoDb: Connection error: ' + err);
  }
});

mongoose.connection.on('open', function(ref) {
  console.log('Connected to mongo server.');
  acl = new acl(new acl.mongodbBackend(dbconnection.connection.db, "acl_"));
  acl.allow('guest', '/a', '*');
  acl.addUserRoles('Vibpositive', 'guest');
  app.use(acl.middleware());
  return app.get('/a', acl.middleware(), function(req, res, next) {
    res.send('a');
    return acl.isAllowed('Vibpositive', 'a', 'get', function(err, res) {
      if (res) {
        console.log("User joed is allowed to view blogs");
        return console.log(res);
      }
    });
  });
});

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

app.use('/profile', profile);

app.use('/controlpanel', controlpanel);

app.listen(port);

console.log('The magic happens on port ' + port);
