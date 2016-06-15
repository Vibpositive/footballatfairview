'use strict'
express      = require('express')
app          = express()
port         = process.env.PORT or 8080
mongoose     = require('mongoose')
passport     = require('passport')
flash        = require('connect-flash')
morgan       = require('morgan')
cookieParser = require('cookie-parser')
bodyParser   = require('body-parser')
session      = require('express-session')
configDB     = require('./app/config/database.js')
acl          = require('acl');
gabriel      = require('express-session')
matches      = require './app/routes/matches'
profile      = require './app/routes/profile'
controlpanel = require './app/routes/controlpanel'

mongoose.connect configDB.url

dbconnection = mongoose.connect configDB.url, (err) ->
	if err
		console.log 'MongoDb: Connection error: ' + err

mongoose.connection.on 'open', (ref) ->
	console.log 'Connected to mongo server.'
	# console.log dbconnection.connection.db

	acl = new acl(new acl.mongodbBackend(dbconnection.connection.db, "acl_"));
	# acl = new acl(new acl.memoryBackend());

	acl.allow('guest', '/a', '*')

	acl.addUserRoles 'Vibpositive', 'guest'

	app.use acl.middleware()

	app.get '/a', acl.middleware(), (req, res, next)->
		res.send 'a'
		acl.isAllowed 'Vibpositive', 'a', 'get', (err, res)->
			if res
				console.log "User joed is allowed to view blogs"
				console.log res
	
require('./app/config/passport') passport

app.use morgan('dev')
app.use cookieParser()
app.use bodyParser()
app.use('/public', express.static('public'))
app.set 'view engine', 'ejs'
app.use session(secret: 'ilovescotchscotchyscotchscotch')
app.use passport.initialize()
app.use passport.session()
app.use flash()
require('./app/routes.js') app, passport
app.use '/matches'      , matches
app.use '/profile'      , profile
app.use '/controlpanel' , controlpanel
app.listen port
console.log 'The magic happens on port ' + port